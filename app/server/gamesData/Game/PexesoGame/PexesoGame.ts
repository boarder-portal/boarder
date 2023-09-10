import flatten from 'lodash/flatten';
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { SETS } from 'common/constants/games/pexeso';
import { SHUFFLE_PERMUTATIONS } from 'server/gamesData/Game/PexesoGame/constants';

import { GameType } from 'common/types/game';
import {
  Card,
  Game,
  GameServerEventType,
  Player,
  PlayerData,
  ShuffleCardsIndexes,
  ShuffleType,
} from 'common/types/games/pexeso';

import { getRandomElement } from 'common/utilities/random';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import TurnGameEntity from 'server/gamesData/Game/utilities/TurnGameEntity';

import Turn from 'server/gamesData/Game/PexesoGame/entities/Turn';

const OPEN_CLOSE_ANIMATION_DURATION = 300;
const OPEN_DURATION = 1600;

export default class PexesoGame extends TurnGameEntity<GameType.PEXESO> {
  cards: Card[] = [];
  playersData: PlayerData[] = this.getPlayersData(() => ({
    score: 0,
  }));
  movesCount = -1;

  turn: Turn | null = null;

  *lifecycle(): EntityGenerator<number[]> {
    const { imagesCount: setImagesCount, imageVariantsCount } = SETS[this.options.set];
    const allIds = times(setImagesCount);
    const ids = (this.options.pickRandomImages ? shuffle(allIds) : allIds).slice(0, this.options.differentCardsCount);
    const allImageVariants = times(imageVariantsCount);

    const shuffledIds = shuffle(
      flatten(
        ids.map((imageId) => {
          const imageVariants = this.options.pickRandomImages ? shuffle(allImageVariants) : allImageVariants;

          return times(this.options.matchingCardsCount, (index) => ({
            imageId,
            imageVariant: imageVariants[this.options.useImageVariants ? index : 0],
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

      this.turn = this.spawnEntity(
        new Turn(this, {
          activePlayerIndex: this.activePlayerIndex,
        }),
      );

      const openedCardsIndexes = yield* this.turn;

      yield* this.delay(OPEN_DURATION + OPEN_CLOSE_ANIMATION_DURATION);

      const openedCards = openedCardsIndexes.map((cardIndex) => this.cards[cardIndex]);
      const areOpenedCardsSame = openedCards.every(({ imageId }) => imageId === openedCards[0].imageId);
      let isGameEnd = false;

      if (areOpenedCardsSame) {
        openedCards.forEach((openedCard) => {
          openedCard.isInGame = false;
        });

        this.playersData[this.activePlayerIndex].score++;

        isGameEnd = this.cards.every((card) => !card.isInGame);

        this.sendSocketEvent(GameServerEventType.REMOVE_CARDS, {
          indexes: openedCardsIndexes,
          shuffleIndexes:
            isGameEnd || this.options.shuffleOptions?.type === ShuffleType.TURNED
              ? null
              : this.shuffleCards(openedCardsIndexes),
        });
      } else {
        this.passTurn();

        this.sendSocketEvent(GameServerEventType.HIDE_CARDS, {
          indexes: openedCardsIndexes,
          shuffleIndexes: this.shuffleCards(openedCardsIndexes),
        });
      }

      this.sendSocketEvent(GameServerEventType.UPDATE_PLAYERS, {
        players: this.getGamePlayers(),
        activePlayerIndex: this.activePlayerIndex,
      });

      if (isGameEnd) {
        break;
      }
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
    if (!this.options.shuffleOptions || this.movesCount % this.options.shuffleOptions.afterMovesCount !== 0) {
      return null;
    }

    let indexesToShuffle: number[];

    if (this.options.shuffleOptions.type === ShuffleType.RANDOM) {
      const allIndexesInPlay = times(this.options.differentCardsCount * this.options.matchingCardsCount).filter(
        (index) => this.cards[index].isInGame,
      );

      indexesToShuffle = shuffle(allIndexesInPlay).slice(0, this.options.shuffleOptions.cardsCount);
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
      activePlayerIndex: this.activePlayerIndex,
      cards: this.cards,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
