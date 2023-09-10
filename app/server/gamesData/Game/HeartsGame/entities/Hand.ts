import chunk from 'lodash/chunk';
import shuffle from 'lodash/shuffle';
import sortBy from 'lodash/sortBy';

import { CARDS_SORT } from 'common/constants/games/common/cards';
import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';
import { DECKS } from 'server/gamesData/Game/HeartsGame/constants';

import { Card, Suit } from 'common/types/cards';
import { GameType } from 'common/types/game';
import { GameClientEventType, Hand as HandModel, HandPlayerData, HandStage, PassDirection } from 'common/types/hearts';

import { isDeuceOfClubs, isHeart, isQueenOfSpades } from 'common/utilities/hearts/common';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import Turn from 'server/gamesData/Game/HeartsGame/entities/Turn';

const ALL_SCORE = 26;
const SUIT_VALUES: Record<Suit, number> = {
  [Suit.CLUBS]: 1,
  [Suit.DIAMONDS]: 1e2,
  [Suit.SPADES]: 1e4,
  [Suit.HEARTS]: 1e6,
};
const SHOW_CARDS_TIMEOUT = 2 * 1000;

export interface HandOptions {
  startStage: HandStage;
}

export default class Hand extends ServerEntity<GameType.HEARTS, number[]> {
  game: HeartsGame;

  stage: HandStage;
  playersData: HandPlayerData[];
  heartsEnteredPlay = false;

  turn: Turn | null = null;

  constructor(game: HeartsGame, options: HandOptions) {
    super(game);

    this.game = game;
    this.stage = options.startStage;
    this.playersData = this.getPlayersData(() => ({
      hand: [],
      chosenCardsIndexes: [],
      takenCards: [],
    }));
  }

  *lifecycle(): EntityGenerator<number[]> {
    const deck = shuffle(DECKS[this.playersCount]);
    const shuffledDeck = chunk(deck, deck.length / this.playersCount);

    this.forEachPlayer((playerIndex) => {
      this.playersData[playerIndex].hand = shuffledDeck[playerIndex];
    });

    this.sortHands();

    if (this.stage === HandStage.PASS) {
      yield* this.passPhase();
    }

    let startPlayerIndex = this.playersData.findIndex(({ hand }) => hand.some(isDeuceOfClubs));

    while (this.playersData.some(({ hand }) => hand.length !== 0)) {
      this.turn = this.spawnEntity(
        new Turn(this, {
          startPlayerIndex,
        }),
      );

      this.game.sendGameInfo();

      const { highestCardPlayerIndex, takenCards: playerTakenCards } = yield* this.turn;

      yield* this.delay(SHOW_CARDS_TIMEOUT);

      startPlayerIndex = highestCardPlayerIndex;
      this.heartsEnteredPlay ||= playerTakenCards.some(isHeart);

      this.playersData[highestCardPlayerIndex].takenCards.push(...playerTakenCards);
    }

    this.turn = null;

    const playerScores = this.playersData.map(({ takenCards }) =>
      takenCards.reduce((score, card) => score + (isHeart(card) ? 1 : isQueenOfSpades(card) ? 13 : 0), 0),
    );
    const takeAllPlayerIndex = playerScores.indexOf(ALL_SCORE);

    return playerScores.map((score, playerIndex) =>
      playerIndex === takeAllPlayerIndex ? 0 : takeAllPlayerIndex === -1 ? score : ALL_SCORE,
    );
  }

  getDeuceOfClubsIndex(playerIndex: number): number {
    return this.playersData[playerIndex].hand.findIndex(isDeuceOfClubs);
  }

  getTargetPlayerIndex(playerIndex: number): number {
    const { passDirection } = this.game;

    if (passDirection === PassDirection.NONE) {
      return playerIndex;
    }

    if (passDirection === PassDirection.LEFT) {
      return (playerIndex + 1) % this.playersCount;
    }

    if (passDirection === PassDirection.RIGHT) {
      return (playerIndex - 1 + this.playersCount) % this.playersCount;
    }

    return (playerIndex + 2) % this.playersCount;
  }

  *passPhase(): EntityGenerator {
    while (this.playersData.some(({ chosenCardsIndexes }) => chosenCardsIndexes.length !== PASS_CARDS_COUNT)) {
      const { data: cardIndex, playerIndex } = yield* this.waitForSocketEvent(GameClientEventType.CHOOSE_CARD);

      const playerChosenCardsIndexes = this.playersData[playerIndex].chosenCardsIndexes;

      if (playerChosenCardsIndexes.includes(cardIndex)) {
        this.playersData[playerIndex].chosenCardsIndexes = playerChosenCardsIndexes.filter(
          (index) => index !== cardIndex,
        );
      } else {
        playerChosenCardsIndexes.push(cardIndex);
      }

      this.game.sendGameInfo();
    }

    const passedCards = this.playersData.map(({ chosenCardsIndexes, hand }) =>
      chosenCardsIndexes.map((cardIndex) => hand[cardIndex]),
    );

    this.playersData.forEach((playerData, playerIndex) => {
      this.playersData[this.getTargetPlayerIndex(playerIndex)].hand.push(...passedCards[playerIndex]);

      playerData.hand = playerData.hand.filter(
        (_card, cardIndex) => !playerData.chosenCardsIndexes.includes(cardIndex),
      );
    });

    this.sortHands();

    this.stage = HandStage.PLAY;
  }

  sortHands(): void {
    this.playersData.forEach((playerData) => {
      playerData.hand = sortBy(playerData.hand, (card) => {
        return SUIT_VALUES[card.suit] + CARDS_SORT.indexOf(card.value);
      });
    });
  }

  takePlayerCard(playerIndex: number, cardIndex: number): Card | null {
    return this.playersData[playerIndex]?.hand.splice(cardIndex, 1)[0] ?? null;
  }

  toJSON(): HandModel {
    return {
      stage: this.stage,
      heartsEnteredPlay: this.heartsEnteredPlay,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
