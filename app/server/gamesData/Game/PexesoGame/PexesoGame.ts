import flatten from 'lodash/flatten';
import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  EPexesoGameEvent,
  EPexesoShuffleType,
  IPexesoCard,
  IPexesoGameInfoEvent,
  IPexesoHideCardsEvent,
  IPexesoPlayer,
  IPexesoRemoveCardsEvent,
  IPexesoShuffleCardsIndexes,
} from 'common/types/pexeso';
import { IPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';

import { getRandomElement } from 'common/utilities/random';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.PEXESO]: {
      sets,
    },
  },
} = GAMES_CONFIG;

const OPEN_CLOSE_ANIMATION_DURATION = 300;
const OPEN_DURATION = 1600;

class PexesoGame extends Game<EGame.PEXESO> {
  static shufflePermutations: number[][][] = [];

  static createAllShufflePermutations() {
    const createShufflePermutations = (cardsCount: number): number[][] => {
      const permutations: number[][] = [];

      const fillPermutations = (currentPermutation: number[]) => {
        if (currentPermutation.length === cardsCount) {
          permutations.push([...currentPermutation]);
        } else {
          for (let i = 0; i < cardsCount; i++) {
            if (i !== currentPermutation.length && !currentPermutation.includes(i)) {
              currentPermutation.push(i);
              fillPermutations(currentPermutation);
              currentPermutation.pop();
            }
          }
        }
      };

      fillPermutations([]);

      return permutations;
    };

    for (let i = 2; i <= 6; i++) {
      PexesoGame.shufflePermutations[i] = createShufflePermutations(i);
    }
  }

  handlers = {
    [EPexesoGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EPexesoGameEvent.OPEN_CARD]: this.onOpenCard,
  };

  cards: IPexesoCard[] = [];
  openedCardsIndexes: number[] = [];
  isShowingCards = false;
  movesCount = 0;

  constructor(options: IGameCreateOptions<EGame.PEXESO>) {
    super(options);

    this.createGameInfo();
  }

  createGameInfo() {
    const {
      imagesCount: setImagesCount,
      imageVariantsCount,
    } = sets[this.options.set];
    const allIds = times(setImagesCount);
    const ids = (
      this.options.pickRandomImages
        ? shuffle(allIds)
        : allIds
    ).slice(0, this.options.differentCardsCount);
    const allImageVariants = times(imageVariantsCount);

    const shuffledIds = shuffle(flatten(
      ids.map((imageId) => {
        const imageVariants = this.options.pickRandomImages
          ? shuffle(allImageVariants)
          : allImageVariants;

        return (
          times(
            this.options.matchingCardsCount,
            (index) => ({
              imageId,
              imageVariant: imageVariants[this.options.useImageVariants ? index : 0],
            }),
          )
        );
      }),
    ));

    this.cards = shuffledIds.map((card) => ({
      ...card,
      isInGame: true,
    }));

    this.players[Math.floor(Math.random() * this.players.length)].isActive = true;
  }

  createPlayer(roomPlayer: IPlayer): IPexesoPlayer {
    return {
      ...roomPlayer,
      isActive: false,
      score: 0,
    };
  }

  onGetGameInfo({ socket }: IGameEvent) {
    const gameInfo: IPexesoGameInfoEvent = {
      options: this.options,
      cards: this.cards,
      openedCardsIndexes: this.openedCardsIndexes,
      players: this.players,
    };

    socket.emit(EPexesoGameEvent.GAME_INFO, gameInfo);
  }

  onOpenCard({ data: cardIndex }: IGameEvent<number>) {
    if (
      this.isShowingCards
      || this.openedCardsIndexes.includes(cardIndex)
      || !this.cards[cardIndex].isInGame
    ) {
      return;
    }

    this.openedCardsIndexes.push(cardIndex);

    this.io.emit(EPexesoGameEvent.OPEN_CARD, cardIndex);

    if (this.openedCardsIndexes.length !== this.options.matchingCardsCount) {
      return;
    }

    this.movesCount++;

    this.isShowingCards = true;

    setTimeout(() => {
      const openedCards = this.openedCardsIndexes.map((cardIndex) => this.cards[cardIndex]);
      const areOpenedCardsSame = openedCards.every(({ imageId }) => imageId === openedCards[0].imageId);
      const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);
      let nextActivePlayerIndex = activePlayerIndex;

      if (areOpenedCardsSame) {
        openedCards.forEach((openedCard) => {
          openedCard.isInGame = false;
        });

        this.players[activePlayerIndex].score++;

        const isGameEnd = this.cards.every((card) => !card.isInGame);
        const removeCardsEvent: IPexesoRemoveCardsEvent = {
          indexes: this.openedCardsIndexes,
          shuffleIndexes: isGameEnd || this.options.shuffleOptions?.type === EPexesoShuffleType.TURNED
            ? null
            : this.shuffleCards(),
        };

        this.io.emit(EPexesoGameEvent.REMOVE_CARDS, removeCardsEvent);

        if (isGameEnd) {
          this.end();
        }
      } else {
        nextActivePlayerIndex = (activePlayerIndex + 1) % this.players.length;

        const hideCardsEvent: IPexesoHideCardsEvent = {
          indexes: this.openedCardsIndexes,
          shuffleIndexes: this.shuffleCards(),
        };

        this.io.emit(EPexesoGameEvent.HIDE_CARDS, hideCardsEvent);
      }

      this.players.forEach((player, index) => {
        player.isActive = index === nextActivePlayerIndex;
      });

      this.io.emit(EPexesoGameEvent.UPDATE_PLAYERS, this.players);

      this.isShowingCards = false;
      this.openedCardsIndexes = [];
    }, OPEN_DURATION + OPEN_CLOSE_ANIMATION_DURATION);
  }

  shuffleCards(): IPexesoShuffleCardsIndexes | null {
    if (
      !this.options.shuffleOptions
      || this.movesCount % this.options.shuffleOptions.afterMovesCount !== 0
    ) {
      return null;
    }

    let indexesToShuffle: number[];

    if (this.options.shuffleOptions.type === EPexesoShuffleType.RANDOM) {
      const allIndexesInPlay = times(this.options.differentCardsCount * this.options.matchingCardsCount)
        .filter((index) => this.cards[index].isInGame);

      indexesToShuffle = shuffle(allIndexesInPlay).slice(0, this.options.shuffleOptions.cardsCount);
    } else {
      indexesToShuffle = this.openedCardsIndexes;
    }

    const cardsAtIndexes = indexesToShuffle.map((index) => this.cards[index]);
    const shufflePermutations = PexesoGame.shufflePermutations[indexesToShuffle.length];
    const randomPermutation = getRandomElement(shufflePermutations);

    cardsAtIndexes.forEach((card, index) => {
      this.cards[indexesToShuffle[randomPermutation[index]]] = card;
    });

    return {
      indexes: indexesToShuffle,
      permutation: randomPermutation,
    };
  }
}

PexesoGame.createAllShufflePermutations();

export default PexesoGame;
