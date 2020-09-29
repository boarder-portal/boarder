import flatten from 'lodash/flatten';
import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  EPexesoGameEvent,
  IPexesoCard,
  IPexesoGameInfoEvent,
  IPexesoCardCoords,
  IPexesoOpenCardEvent,
  IPexesoPlayer,
} from 'common/types/pexeso';
import { EGame, IPlayer } from 'common/types';
import { IGameEvent } from 'server/types';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    pexeso: {
      fieldSizes,
      sets,
    },
  },
} = GAMES_CONFIG;

class PexesoGame extends Game<EGame.PEXESO> {
  handlers = {
    [EPexesoGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EPexesoGameEvent.OPEN_CARD]: this.onOpenCard,
  };

  cards: IPexesoCard[][] = [];
  openedCardsCoords: IPexesoCardCoords[] = [];
  isShowingCards = false;

  constructor(options: IGameCreateOptions<EGame.PEXESO>) {
    super(options);

    this.createGameInfo();
  }

  createGameInfo() {
    const cards: IPexesoCard[][] = [];
    const {
      imagesCount: setImagesCount,
    } = sets[this.options.set];
    const allIds = times(setImagesCount);
    const ids = (
      this.options.pickRandomImages
        ? shuffle(allIds)
        : allIds
    ).slice(0, this.options.differentCardsCount);

    const shuffledIds = shuffle(flatten(
      ids.map((imageId) => (
        times(
          this.options.matchingCardsCount,
          (index) => ({ imageId, imageVariant: this.options.useImageVariants ? index : 0 }),
        )
      )),
    ));

    const {
      width,
      height,
    } = fieldSizes[this.options.differentCardsCount * this.options.matchingCardsCount];

    times(height, (y) => {
      cards.push([]);

      times(width, (x) => {
        cards[y].push({
          ...shuffledIds[y * width + x],
          isInGame: true,
        });
      });
    });

    this.cards = cards;
    this.openedCardsCoords = [];

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
    socket.emit(EPexesoGameEvent.GAME_INFO, {
      options: this.options,
      cards: this.cards,
      openedCardsCoords: this.openedCardsCoords,
      players: this.players,
    } as IPexesoGameInfoEvent);
  }

  onOpenCard({ data: { x, y } }: IGameEvent<IPexesoOpenCardEvent>) {
    if (this.isShowingCards || this.openedCardsCoords.some((cardCoords) => cardCoords.x === x && cardCoords.y === y)) {
      return;
    }

    this.openedCardsCoords.push({ x, y });

    this.io.emit(EPexesoGameEvent.OPEN_CARD, { x, y });

    if (this.openedCardsCoords.length === this.options.matchingCardsCount) {
      this.isShowingCards = true;

      setTimeout(() => {
        const openedCards = this.openedCardsCoords.map(({ x, y }) => this.cards[y][x]);
        const areOpenedCardsSame = openedCards.every(({ imageId }) => imageId === openedCards[0].imageId);
        const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);
        let nextActivePlayerIndex = activePlayerIndex;

        if (areOpenedCardsSame) {
          for (const openedCard of openedCards) {
            openedCard.isInGame = false;
          }

          this.players[activePlayerIndex].score++;

          this.io.emit(EPexesoGameEvent.REMOVE_CARDS, this.openedCardsCoords);
        } else {
          nextActivePlayerIndex = (activePlayerIndex + 1) % this.players.length;

          this.io.emit(EPexesoGameEvent.HIDE_CARDS);
        }

        this.players.forEach((player, index) => {
          player.isActive = index === nextActivePlayerIndex;
        });

        this.io.emit(EPexesoGameEvent.UPDATE_PLAYERS, this.players);

        this.isShowingCards = false;
        this.openedCardsCoords = [];
      }, 2000);
    }
  }
}

export default PexesoGame;
