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

import { getRandomElement } from 'common/utilities/random';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

import Turn from 'server/gamesData/Game/PexesoGame/entities/Turn';

export default class PexesoGame extends Entity<GameResult> {
  turnController = this.obtainComponent(TurnController);
  gameInfo = this.obtainComponent(GameInfo<GameType.PEXESO, this>);
  time = this.obtainComponent(Time);
  server = this.obtainComponent(Server<GameType.PEXESO, this>);

  cards: Card[] = [];
  playersData = this.gameInfo.createPlayersData<PlayerData>({
    init: () => ({
      score: 0,
    }),
  });
  movesCount = -1;

  turn: Turn | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    const { set, matchingCardsCount, differentCardsCount, pickRandomImages, useImageVariants, shuffleOptions } =
      this.gameInfo.options;
    const { imagesCount: setImagesCount, imageVariantsCount } = SETS[set];
    const allIds = times(setImagesCount);
    const ids = (pickRandomImages ? shuffle(allIds) : allIds).slice(0, differentCardsCount);
    const allImageVariants = times(imageVariantsCount);

    const shuffledIds = shuffle(
      ids
        .map((imageId) => {
          const imageVariants = pickRandomImages ? shuffle(allImageVariants) : allImageVariants;

          return times(matchingCardsCount, (index) => ({
            imageId,
            imageVariant: imageVariants[useImageVariants ? index : 0],
          }));
        })
        .flat(),
    );

    this.cards = shuffledIds.map((card) => ({
      ...card,
      isInGame: true,
    }));

    while (true) {
      this.movesCount++;

      this.turn = this.spawnEntity(Turn);

      const openedCardsIndexes = yield* this.waitForEntity(this.turn);

      yield* this.time.delay(OPEN_DURATION);

      const openedCards = openedCardsIndexes.map((cardIndex) => this.cards[cardIndex]);
      const areOpenedCardsSame = openedCards.every(({ imageId }) => imageId === openedCards[0].imageId);
      let isGameEnd = false;

      if (areOpenedCardsSame) {
        openedCards.forEach((openedCard) => {
          openedCard.isInGame = false;
        });

        this.playersData.getActive().score++;

        isGameEnd = this.cards.every((card) => !card.isInGame);

        this.server.sendSocketEvent(GameServerEventType.REMOVE_CARDS, {
          indexes: openedCardsIndexes,
          shuffleIndexes:
            isGameEnd || shuffleOptions?.type === ShuffleType.TURNED ? null : this.shuffleCards(openedCardsIndexes),
        });
      } else {
        this.turnController.passTurn();

        this.server.sendSocketEvent(GameServerEventType.HIDE_CARDS, {
          indexes: openedCardsIndexes,
          shuffleIndexes: this.shuffleCards(openedCardsIndexes),
        });
      }

      this.server.sendSocketEvent(GameServerEventType.UPDATE_PLAYERS, {
        players: this.getGamePlayers(),
        activePlayerIndex: this.turnController.activePlayerIndex,
      });

      if (isGameEnd) {
        break;
      }

      yield* this.time.delay(CARD_ANIMATION_DURATION);
    }

    this.turn = null;

    return this.playersData.map(({ score }) => score);
  }

  getGamePlayers(): Player[] {
    return this.gameInfo.getPlayersWithData((playerIndex) => this.playersData.get(playerIndex));
  }

  isCardInGame(cardIndex: number): boolean {
    return this.cards[cardIndex].isInGame;
  }

  shuffleCards(openedCardsIndexes: number[]): ShuffleCardsIndexes | null {
    const { matchingCardsCount, differentCardsCount, shuffleOptions } = this.gameInfo.options;

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
