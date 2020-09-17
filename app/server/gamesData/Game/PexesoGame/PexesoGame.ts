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

  cards: IPexesoCard[][] = [];
  openedCardsCoords: IPexesoCardCoords[] = [];
  isShowingCards = false;

  constructor({ game, players }: { game: EGame; players: IPexesoPlayer[] }) {
    super({ game, players });

    this.createGameInfo();
  }

  createGameInfo() {
    const cards: IPexesoCard[][] = [];

    const shuffledIds = shuffle(flatten(times(commonSet.width * commonSet.height / 2, (id) => [id, id])));

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
      cards: this.cards,
      openedCardsCoords: this.openedCardsCoords,
      players: this.players,
    } as IPexesoGameInfoEvent);
  }

  onOpenCard({ data: { x, y } }: { data: { x: number; y: number } }) {
    if (this.isShowingCards) {
      return;
    }

    this.openedCardsCoords.push({ x, y });

    this.io.emit(EPexesoGameEvent.OPEN_CARD, { x, y });

    if (this.openedCardsCoords.length === 2) {
      this.isShowingCards = true;

      setTimeout(() => {
        const [firstCoords, secondCoords] = this.openedCardsCoords;
        const firstCard = this.cards[firstCoords.y][firstCoords.x];
        const secondCard = this.cards[secondCoords.y][secondCoords.x];

        const areOpenedCardsSame = firstCard.id === secondCard.id;

        this.openedCardsCoords = [];

        const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);
        let nextActivePlayerIndex = activePlayerIndex;

        if (areOpenedCardsSame) {
          firstCard.isInGame = false;
          secondCard.isInGame = false;

          this.players[activePlayerIndex].score++;

          this.io.emit(EPexesoGameEvent.REMOVE_CARDS, [firstCoords, secondCoords]);
        } else {
          nextActivePlayerIndex = (activePlayerIndex + 1) % this.players.length;

          this.io.emit(EPexesoGameEvent.HIDE_CARDS);
        }

        this.players.forEach((player, index) => {
          player.isActive = index === nextActivePlayerIndex;
        });

        this.io.emit(EPexesoGameEvent.UPDATE_PLAYERS, this.players);

        this.isShowingCards = false;
      }, 2000);
    }
  }
}

export default PexesoGame;
