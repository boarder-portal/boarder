import flatten from 'lodash/flatten';
import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  EPexesoGameEvent,
  IPexesoCard,
  IPexesoGameInfoEvent,
  IPexesoPlayer,
} from 'common/types/pexeso';
import { EGame, IPlayer } from 'common/types';
import { IGameEvent } from 'server/types';

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
  handlers = {
    [EPexesoGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EPexesoGameEvent.OPEN_CARD]: this.onOpenCard,
  };

  cards: IPexesoCard[] = [];
  openedCardsIndexes: number[] = [];
  isShowingCards = false;

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

    const activePlayerIndex = Math.floor(Math.random() * this.players.length);

    this.players = this.players.map((player, index) => ({
      ...player,
      isActive: index === activePlayerIndex,
      score: 0,
    }));
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

    if (this.openedCardsIndexes.length === this.options.matchingCardsCount) {
      this.isShowingCards = true;

      setTimeout(() => {
        const openedCards = this.openedCardsIndexes.map((cardIndex) => this.cards[cardIndex]);
        const areOpenedCardsSame = openedCards.every(({ imageId }) => imageId === openedCards[0].imageId);
        const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);
        let nextActivePlayerIndex = activePlayerIndex;

        if (areOpenedCardsSame) {
          for (const openedCard of openedCards) {
            openedCard.isInGame = false;
          }

          this.players[activePlayerIndex].score++;

          this.io.emit(EPexesoGameEvent.REMOVE_CARDS, this.openedCardsIndexes);

          const isGameEnd = this.cards.every((card) => !card.isInGame);

          if (isGameEnd) {
            this.end();
          }
        } else {
          nextActivePlayerIndex = (activePlayerIndex + 1) % this.players.length;

          this.io.emit(EPexesoGameEvent.HIDE_CARDS, this.openedCardsIndexes);
        }

        this.players.forEach((player, index) => {
          player.isActive = index === nextActivePlayerIndex;
        });

        this.io.emit(EPexesoGameEvent.UPDATE_PLAYERS, this.players);

        this.isShowingCards = false;
        this.openedCardsIndexes = [];
      }, OPEN_DURATION + OPEN_CLOSE_ANIMATION_DURATION);
    }
  }
}

export default PexesoGame;
