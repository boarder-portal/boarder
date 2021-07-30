import cloneDeep from 'lodash/cloneDeep';
import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import {
  ECarcassoneGameEvent,
  ICarcassoneCard,
  ICarcassoneGameInfoEvent,
  ICarcassonePlayer,
  ICarcassoneTile,
} from 'common/types/carcassone';
import { IPlayer } from 'common/types';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.CARCASSONE]: {
      cards,
      board,
    },
  },
} = GAMES_CONFIG;

class CarcassoneGame extends Game<EGame.CARCASSONE> {
  handlers = {
    [ECarcassoneGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };

  cards: ICarcassoneCard[] = cloneDeep(cards).map((card) => times(card.count, () => card)).flat();
  board: ICarcassoneTile[][] = times(board.size.y, (y) => times(board.size.x, (x) => ({
    x,
    y,
    card: null,
  })));

  constructor(options: IGameCreateOptions<EGame.CARCASSONE>) {
    super(options);

    this.createGameInfo();
  }

  createPlayer(roomPlayer: IPlayer): ICarcassonePlayer {
    return {
      ...roomPlayer,
      isActive: false,
      score: 0,
    };
  }

  createGameInfo() {
    this.board[Math.floor(board.size.y / 2)][Math.floor(board.size.x / 2)].card = this.cards.shift() || null;

    this.cards = shuffle(this.cards);

    const activePlayerIndex = Math.floor(Math.random() * this.players.length);

    this.players = this.players.map((player, index) => ({
      ...player,
      isActive: index === activePlayerIndex,
    }));
  }

  onGetGameInfo({ socket }: IGameEvent) {
    const gameInfo: ICarcassoneGameInfoEvent = {
      players: this.players,
      board: this.board,
    };

    socket.emit(ECarcassoneGameEvent.GAME_INFO, gameInfo);
  }
}

export default CarcassoneGame;
