import times from 'lodash/times';
import shuffle from 'lodash/shuffle';
import flatten from 'lodash/flatten';

import { SHUFFLE_PERMUTATIONS } from 'server/gamesData/Game/PexesoGame/constants';
import { SETS } from 'common/constants/games/pexeso';

import { EGame } from 'common/types/game';
import {
  EGameEvent,
  EShuffleType,
  ICard,
  IGame,
  IGameOptions,
  IGamePlayerData,
  IPlayer,
  IShuffleCardsIndexes,
} from 'common/types/pexeso';
import { IGamePlayer } from 'common/types';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { getRandomElement } from 'common/utilities/random';

import Turn from 'server/gamesData/Game/PexesoGame/entities/Turn';

const OPEN_CLOSE_ANIMATION_DURATION = 300;
const OPEN_DURATION = 1600;

export default class PexesoGame extends GameEntity<EGame.PEXESO> {
  players: IGamePlayer[];
  options: IGameOptions;

  cards: ICard[] = [];
  playersData: IGamePlayerData[] = [];
  activePlayerIndex = 0;
  movesCount = -1;

  turn: Turn | null = null;

  constructor(players: IGamePlayer[], options: IGameOptions) {
    super();

    this.players = players;
    this.playersData = players.map(() => ({
      score: 0,
    }));
    this.options = options;
  }

  *lifecycle() {
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

        this.sendSocketEvent(EGameEvent.REMOVE_CARDS, {
          indexes: openedCardsIndexes,
          shuffleIndexes:
            isGameEnd || this.options.shuffleOptions?.type === EShuffleType.TURNED
              ? null
              : this.shuffleCards(openedCardsIndexes),
        });
      } else {
        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;

        this.sendSocketEvent(EGameEvent.HIDE_CARDS, {
          indexes: openedCardsIndexes,
          shuffleIndexes: this.shuffleCards(openedCardsIndexes),
        });
      }

      this.sendSocketEvent(EGameEvent.UPDATE_PLAYERS, {
        players: this.getGamePlayers(),
        activePlayerIndex: this.activePlayerIndex,
      });

      if (isGameEnd) {
        break;
      }
    }

    this.turn = null;
  }

  getGamePlayers(): IPlayer[] {
    return this.players.map((player) => ({
      ...player,
      data: this.playersData[player.index],
    }));
  }

  isCardInGame(cardIndex: number): boolean {
    return this.cards[cardIndex].isInGame;
  }

  shuffleCards(openedCardsIndexes: number[]): IShuffleCardsIndexes | null {
    if (!this.options.shuffleOptions || this.movesCount % this.options.shuffleOptions.afterMovesCount !== 0) {
      return null;
    }

    let indexesToShuffle: number[];

    if (this.options.shuffleOptions.type === EShuffleType.RANDOM) {
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

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
      options: this.options,
      activePlayerIndex: this.activePlayerIndex,
      cards: this.cards,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
