import flatten from 'lodash/flatten';
import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  EPexesoGameEvent,
  IPexesoCard,
  IPexesoGameInfoEvent,
  IPexesoCardCoords,
  IPexesoPlayer,
  IPexesoGameOptions,
} from 'common/types/pexeso';
import { EGame } from 'common/types';
import { IAuthSocket } from 'server/types';

import Game from 'server/gamesData/Game/Game';

const {
  games: {
    pexeso: {
      sets: {
        common: commonSet,
      },
    },
  },
} = GAMES_CONFIG;

class PexesoGame extends Game<IPexesoPlayer> {
  handlers = {
    [EPexesoGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EPexesoGameEvent.OPEN_CARD]: this.onOpenCard,
  }

  options: IPexesoGameOptions;
  cards: IPexesoCard[][] = [];
  openedCardsCoords: IPexesoCardCoords[] = [];
  isShowingCards = false;

  constructor({
    game,
    players,
    options,
  }: {
    game: EGame;
    players: IPexesoPlayer[];
    options: IPexesoGameOptions;
  }) {
    super({ game, players });

    this.options = options;

    this.createGameInfo();
  }

  createGameInfo() {
    const cards: IPexesoCard[][] = [];

    const shuffledIds = shuffle(flatten(times(
      commonSet.width * commonSet.height / this.options.sameCardsCount,
      (id) => new Array(this.options.sameCardsCount).fill(id),
    )));

    times(commonSet.height, (y) => {
      cards.push([]);

      times(commonSet.width, (x) => {
        cards[y].push({
          id: shuffledIds[y * commonSet.width + x],
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

  onGetGameInfo({ socket }: { socket: IAuthSocket }) {
    socket.emit(EPexesoGameEvent.GAME_INFO, {
      options: this.options,
      cards: this.cards,
      openedCardsCoords: this.openedCardsCoords,
      players: this.players,
    } as IPexesoGameInfoEvent);
  }

  onOpenCard({ data: { x, y } }: { data: { x: number; y: number } }) {
    if (this.isShowingCards || this.openedCardsCoords.some((cardCoords) => cardCoords.x === x && cardCoords.y === y)) {
      return;
    }

    this.openedCardsCoords.push({ x, y });

    this.io.emit(EPexesoGameEvent.OPEN_CARD, { x, y });

    if (this.openedCardsCoords.length === this.options.sameCardsCount) {
      this.isShowingCards = true;

      setTimeout(() => {
        const openedCards = this.openedCardsCoords.map(({ x, y }) => this.cards[y][x]);
        const areOpenedCardsSame = openedCards.every(({ id }) => id === openedCards[0].id);
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
