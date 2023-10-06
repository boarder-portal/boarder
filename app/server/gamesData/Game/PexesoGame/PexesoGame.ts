import flatten from 'lodash/flatten';
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { CARD_ANIMATION_DURATION, OPEN_DURATION, SETS } from 'common/constants/games/pexeso';
import { SHUFFLE_PERMUTATIONS } from 'server/gamesData/Game/PexesoGame/constants';

import { GameType } from 'common/types/game';
import {
  Card,
  Game,
  GameResult,
  GameServerEventType,
  Player,
  PlayerData,
  ShuffleCardsIndexes,
  ShuffleType,
} from 'common/types/games/pexeso';

import { EntityGenerator } from 'common/utilities/Entity';
import { getRandomElement } from 'common/utilities/random';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import TurnController from 'server/gamesData/Game/utilities/TurnController';

import Turn from 'server/gamesData/Game/PexesoGame/entities/Turn';

export default class PexesoGame extends GameEntity<GameType.PEXESO> {
  cards: Card[] = [];
  playersData: PlayerData[] = this.getPlayersData(() => ({
    score: 0,
  }));
  turnController = new TurnController({
    players: this.playersData,
  });
  movesCount = -1;

  turn: Turn | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    const { set, matchingCardsCount, differentCardsCount, pickRandomImages, useImageVariants, shuffleOptions } =
      this.options;
    const { imagesCount: setImagesCount, imageVariantsCount } = SETS[set];
    const allIds = times(setImagesCount);
    const ids = (pickRandomImages ? shuffle(allIds) : allIds).slice(0, differentCardsCount);
    const allImageVariants = times(imageVariantsCount);

    const shuffledIds = shuffle(
      flatten(
        ids.map((imageId) => {
          const imageVariants = pickRandomImages ? shuffle(allImageVariants) : allImageVariants;

          return times(matchingCardsCount, (index) => ({
            imageId,
            imageVariant: imageVariants[useImageVariants ? index : 0],
          }));
        }),
      ),
    );

    this.cards = shuffledIds.map((card) => ({
      ...card,
      isInGame: true,
    }));

    while (true) {
      this.movesCount++;

      this.turn = new Turn(this);

      const openedCardsIndexes = yield* this.waitForEntity(this.turn);

      yield* this.delay(OPEN_DURATION);

      const openedCards = openedCardsIndexes.map((cardIndex) => this.cards[cardIndex]);
      const areOpenedCardsSame = openedCards.every(({ imageId }) => imageId === openedCards[0].imageId);
      let isGameEnd = false;

      if (areOpenedCardsSame) {
        openedCards.forEach((openedCard) => {
          openedCard.isInGame = false;
        });

        this.turnController.getActivePlayer().score++;

        isGameEnd = this.cards.every((card) => !card.isInGame);

        this.sendSocketEvent(GameServerEventType.REMOVE_CARDS, {
          indexes: openedCardsIndexes,
          shuffleIndexes:
            isGameEnd || shuffleOptions?.type === ShuffleType.TURNED ? null : this.shuffleCards(openedCardsIndexes),
        });
      } else {
        this.turnController.passTurn();

        this.sendSocketEvent(GameServerEventType.HIDE_CARDS, {
          indexes: openedCardsIndexes,
          shuffleIndexes: this.shuffleCards(openedCardsIndexes),
        });
      }

      this.sendSocketEvent(GameServerEventType.UPDATE_PLAYERS, {
        players: this.getGamePlayers(),
        activePlayerIndex: this.turnController.activePlayerIndex,
      });

      if (isGameEnd) {
        break;
      }

      yield* this.delay(CARD_ANIMATION_DURATION);
    }

    this.turn = null;

    return this.playersData.map(({ score }) => score);
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  isCardInGame(cardIndex: number): boolean {
    return this.cards[cardIndex].isInGame;
  }

  shuffleCards(openedCardsIndexes: number[]): ShuffleCardsIndexes | null {
    const { matchingCardsCount, differentCardsCount, shuffleOptions } = this.options;

    if (!shuffleOptions || this.movesCount % shuffleOptions.afterMovesCount !== 0) {
      return null;
    }

    let indexesToShuffle: number[];

    if (shuffleOptions.type === ShuffleType.RANDOM) {
      const allIndexesInPlay = times(differentCardsCount * matchingCardsCount).filter(
        (index) => this.cards[index].isInGame,
      );

      indexesToShuffle = shuffle(allIndexesInPlay).slice(0, shuffleOptions.cardsCount);
    } else {
      indexesToShuffle = openedCardsIndexes;
    }

    const cardsAtIndexes = indexesToShuffle.map((index) => this.cards[index]);
    const shufflePermutations = SHUFFLE_PERMUTATIONS[indexesToShuffle.length];
    const randomPermutation = getRandomElement(shufflePermutations);

    cardsAtIndexes.forEach((card, index) => {
      this.cards[indexesToShuffle[randomPermutation[index]]] = card;
    });

    return {
      indexes: indexesToShuffle,
      permutation: randomPermutation,
    };
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      activePlayerIndex: this.turnController.activePlayerIndex,
      cards: this.cards,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
