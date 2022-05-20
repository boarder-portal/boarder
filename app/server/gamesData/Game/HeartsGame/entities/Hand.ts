import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import sortBy from 'lodash/sortBy';

import { CARDS_SORT } from 'common/constants/games/common/cards';
import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';
import { DECKS } from 'server/gamesData/Game/HeartsGame/constants';

import { EGame } from 'common/types/game';
import { EGameEvent, EHandStage, EPassDirection, IHand, IHandPlayerData } from 'common/types/hearts';
import { ESuit, ICard } from 'common/types/cards';

import Entity from 'server/gamesData/Game/utilities/Entity';
import { isDeuceOfClubs, isHeart, isQueenOfSpades } from 'common/utilities/hearts';

import HeartsGame from 'server/gamesData/Game/HeartsGame/entities/HeartsGame';
import Turn from 'server/gamesData/Game/HeartsGame/entities/Turn';

const ALL_SCORE = 26;
const SUIT_VALUES: Record<ESuit, number> = {
  [ESuit.CLUBS]: 1,
  [ESuit.DIAMONDS]: 1e2,
  [ESuit.SPADES]: 1e4,
  [ESuit.HEARTS]: 1e6,
};
const SHOW_CARDS_TIMEOUT = 2 * 1000;

export interface IHandOptions {
  startStage: EHandStage;
}

export default class Hand extends Entity<EGame.HEARTS, number[]> {
  game: HeartsGame;

  stage: EHandStage;
  playersData: IHandPlayerData[];
  heartsEnteredPlay = false;

  turn: Turn | null = null;

  constructor(game: HeartsGame, options: IHandOptions) {
    super(game);

    this.game = game;
    this.stage = options.startStage;
    this.playersData = this.getPlayersData(() => ({
      hand: [],
      chosenCardsIndexes: [],
      takenCards: [],
    }));
  }

  *lifecycle() {
    const deck = shuffle(DECKS[this.playersCount]);
    const shuffledDeck = chunk(deck, deck.length / this.playersCount);

    this.forEachPlayer((playerIndex) => {
      this.playersData[playerIndex].hand = shuffledDeck[playerIndex];
    });

    this.sortHands();

    if (this.stage === EHandStage.PASS) {
      while (this.playersData.some(({ chosenCardsIndexes }) => chosenCardsIndexes.length !== PASS_CARDS_COUNT)) {
        const { data: cardIndex, playerIndex } = yield* this.waitForSocketEvent(EGameEvent.CHOOSE_CARD);

        const playerChosenCardsIndexes = this.playersData[playerIndex].chosenCardsIndexes;

        if (playerChosenCardsIndexes.includes(cardIndex)) {
          this.playersData[playerIndex].chosenCardsIndexes = playerChosenCardsIndexes.filter(
            (index) => index !== cardIndex,
          );
        } else {
          playerChosenCardsIndexes.push(cardIndex);
        }

        this.game.sendInfo();
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

      this.stage = EHandStage.PLAY;
    }

    let startPlayerIndex = this.playersData.findIndex(({ hand }) => hand.some(isDeuceOfClubs));

    while (this.playersData.some(({ hand }) => hand.length !== 0)) {
      this.turn = this.spawnEntity(
        new Turn(this, {
          startPlayerIndex,
        }),
      );

      this.game.sendInfo();

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

    if (passDirection === EPassDirection.NONE) {
      return playerIndex;
    }

    if (passDirection === EPassDirection.LEFT) {
      return (playerIndex + 1) % this.playersCount;
    }

    if (passDirection === EPassDirection.RIGHT) {
      return (playerIndex - 1 + this.playersCount) % this.playersCount;
    }

    return (playerIndex + 2) % this.playersCount;
  }

  sortHands(): void {
    this.playersData.forEach((playerData) => {
      playerData.hand = sortBy(playerData.hand, (card) => {
        return SUIT_VALUES[card.suit] + CARDS_SORT.indexOf(card.value);
      });
    });
  }

  takePlayerCard(playerIndex: number, cardIndex: number): ICard | null {
    return this.playersData[playerIndex]?.hand.splice(cardIndex, 1)[0] ?? null;
  }

  toJSON(): IHand {
    return {
      stage: this.stage,
      heartsEnteredPlay: this.heartsEnteredPlay,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
