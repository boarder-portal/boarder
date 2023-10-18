import chunk from 'lodash/chunk';
import shuffle from 'lodash/shuffle';
import sortBy from 'lodash/sortBy';

import { SECOND } from 'common/constants/date';
import { CARDS_SORT } from 'common/constants/game/cards';
import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';
import { DECKS } from 'server/gamesData/Game/HeartsGame/constants';

import { GameType } from 'common/types/game';
import { Card, Suit } from 'common/types/game/cards';
import {
  GameClientEventType,
  Hand as HandModel,
  HandPlayerData,
  HandStage,
  PassDirection,
} from 'common/types/games/hearts';

import { isDeuceOfClubs, isHeart, isQueenOfSpades } from 'common/utilities/games/hearts/common';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';

import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import Turn from 'server/gamesData/Game/HeartsGame/entities/Turn';

const ALL_SCORE = 26;
const SUIT_VALUES: Record<Suit, number> = {
  [Suit.CLUBS]: 1,
  [Suit.DIAMONDS]: 1e2,
  [Suit.SPADES]: 1e4,
  [Suit.HEARTS]: 1e6,
};
const SHOW_CARDS_TIMEOUT = 2 * SECOND;

export interface HandOptions {
  startStage: HandStage;
}

export default class Hand extends Entity<number[]> {
  game = this.getClosestEntity(HeartsGame);

  gameInfo = this.obtainComponent(GameInfo<GameType.HEARTS, this>);
  server = this.obtainComponent(Server<GameType.HEARTS, this>);
  time = this.obtainComponent(Time);

  stage: HandStage;
  playersData = this.gameInfo.createPlayersData<HandPlayerData>({
    init: () => ({
      hand: [],
      chosenCardsIndexes: [],
      takenCards: [],
    }),
  });
  heartsEnteredPlay = false;

  turn: Turn | null = null;

  constructor(options: HandOptions) {
    super();

    this.stage = options.startStage;
  }

  *lifecycle(): EntityGenerator<number[]> {
    const deck = shuffle(DECKS[this.gameInfo.playersCount]);
    const shuffledDeck = chunk(deck, deck.length / this.gameInfo.playersCount);

    this.playersData.forEach((playerData, playerIndex) => {
      playerData.hand = shuffledDeck[playerIndex];
    });

    this.sortHands();

    if (this.stage === HandStage.PASS) {
      yield* this.passPhase();
    }

    let startPlayerIndex = this.playersData.findIndex(({ hand }) => hand.some(isDeuceOfClubs));

    while (this.playersData.some(({ hand }) => hand.length !== 0)) {
      this.turn = this.spawnEntity(Turn, {
        startPlayerIndex,
      });

      this.server.sendGameInfo();

      const { highestCardPlayerIndex, takenCards: playerTakenCards } = yield* this.waitForEntity(this.turn);

      yield* this.time.delay(SHOW_CARDS_TIMEOUT);

      startPlayerIndex = highestCardPlayerIndex;
      this.heartsEnteredPlay ||= playerTakenCards.some(isHeart);

      this.playersData.get(highestCardPlayerIndex).takenCards.push(...playerTakenCards);
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
    return this.playersData.get(playerIndex).hand.findIndex(isDeuceOfClubs);
  }

  getTargetPlayerIndex(playerIndex: number): number {
    const { passDirection } = this.game;

    if (passDirection === PassDirection.NONE) {
      return playerIndex;
    }

    if (passDirection === PassDirection.LEFT) {
      return (playerIndex + 1) % this.gameInfo.playersCount;
    }

    if (passDirection === PassDirection.RIGHT) {
      return (playerIndex - 1 + this.gameInfo.playersCount) % this.gameInfo.playersCount;
    }

    return (playerIndex + 2) % this.gameInfo.playersCount;
  }

  *passPhase(): EntityGenerator {
    while (this.playersData.some(({ chosenCardsIndexes }) => chosenCardsIndexes.length !== PASS_CARDS_COUNT)) {
      const { data: cardIndex, playerIndex } = yield* this.server.waitForSocketEvent(GameClientEventType.CHOOSE_CARD);

      const playerChosenCardsIndexes = this.playersData.get(playerIndex).chosenCardsIndexes;

      if (playerChosenCardsIndexes.includes(cardIndex)) {
        this.playersData.get(playerIndex).chosenCardsIndexes = playerChosenCardsIndexes.filter(
          (index) => index !== cardIndex,
        );
      } else {
        playerChosenCardsIndexes.push(cardIndex);
      }

      this.server.sendGameInfo();
    }

    const passedCards = this.playersData.map(({ chosenCardsIndexes, hand }) =>
      chosenCardsIndexes.map((cardIndex) => hand[cardIndex]),
    );

    this.playersData.forEach((playerData, playerIndex) => {
      this.playersData.get(this.getTargetPlayerIndex(playerIndex)).hand.push(...passedCards[playerIndex]);

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
    return this.playersData.get(playerIndex)?.hand.splice(cardIndex, 1).at(0) ?? null;
  }

  toJSON(): HandModel {
    return {
      stage: this.stage,
      heartsEnteredPlay: this.heartsEnteredPlay,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
