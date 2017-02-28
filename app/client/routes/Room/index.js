import io from 'socket.io-client';
import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import template from './index.pug';
import { Emitter } from '../../helpers';
import { games as gamesConfig, colors } from '../../../config/constants.json';

import './blocks/CommonPlayersInGameBlock';

const {
  global: {
    roomStatuses,
    playerRoles,
    events: {
      room: {
        ENTER_ROOM,
        UPDATE_ROOM,
        TOGGLE_PLAYER_STATUS
      },
      game: {
        PREPARING_GAME,
        GAME_STARTED,
        GAME_FINISHING,
        GAME_FINISHED,
        UPDATE_PLAYERS,
        UPDATE_GAME
      }
    }
  }
} = gamesConfig;

class Room extends Block {
  static template = template();
  static routerOptions = {
    name: 'room',
    parent: 'game',
    path: '/:roomId'
  };

  colors = colors;
  playerRoles = playerRoles;
  roomStatuses = roomStatuses;

  constructor(opts) {
    super(opts);

    this.reset();
  }

  reset() {
    _.assign(this, {
      socket: null,
      roomData: null,
      status: null,
      plannedRole: null,
      role: null,
      ready: false,
      gameData: null,
      players: null,
      isMyTurn: false,
      emitter: null
    });
  }

  beforeLoadRoute() {
    const {
      params: {
        game,
        roomId
      },
      query: { observe },
      pathname
    } = this.args.route;
    const nsp = gamesConfig[game].ROOM_NSP;
    const socket = this.socket = io(nsp.replace(/\$roomId/, roomId), {
      forceNew: true,
      query: {
        role: observe ? 'observer' : ''
      }
    });

    this.emitter = new Emitter();
    this.gameName = game;
    this.plannedRole = observe
      ? playerRoles.OBSERVER
      : playerRoles.PLAYER;

    socket.on(ENTER_ROOM, this.onEnterRoom);
    socket.on(UPDATE_ROOM, this.onUpdateRoom);
    socket.on(PREPARING_GAME, this.onPreparingGame);
    socket.on(GAME_STARTED, this.onGameStarted);
    socket.on(GAME_FINISHING, this.onGameFinishing);
    socket.on(GAME_FINISHED, this.onGameFinished);
    socket.on(UPDATE_PLAYERS, this.onUpdatePlayers);
    socket.on(UPDATE_GAME, this.onUpdateGame);
    socket.on('connect', () => {
      console.log('connected to room');
    });
    socket.on('error', (err) => {
      console.log(err);

      if (err === 'Invalid namespace') {
        this.router.redirect('not-found', {
          query: {
            path: pathname
          }
        });

        return;
      }

      this.router.go('login');
    });
    socket.on('disconnect', () => {
      console.log('disconnected from room');
    });

    setTimeout(() => {
      this.title.text(this.i18n.t(`games.${ game }_caption`));
    }, 0);
  }

  beforeLeaveRoute() {
    this.socket.disconnect();
    this.reset();
  }

  startGame(gameData) {
    console.log(gameData);

    this.gameData = gameData;
    this.players = gameData.players;
    this.setIsMyTurn();
  }

  onEnterRoom = (roomData) => {
    this.roomData = roomData.room;
    this.gameData = roomData.room.game;
    this.status = roomData.room.status;
    this.role = roomData.role;
    this.ready = false;

    if (roomData.room.game) {
      this.startGame(roomData.room.game);
    }
  };

  onUpdateRoom = (roomData) => {
    const { login } = this.globals.user;

    this.roomData = roomData;

    if (this.role === playerRoles.OBSERVER) {
      return;
    }

    this.ready = _.find(roomData.players, (player) => player && player.login === login).ready;
  };

  onPreparingGame = () => {
    this.status = roomStatuses.PREPARING;
  };

  onGameStarted = (gameData) => {
    this.status = roomStatuses.PLAYING;
    this.startGame(gameData);
  };

  onGameFinishing = (players) => {
    this.status = roomStatuses.FINISHING;
    this.players = _.sortByField(players, 'score', true);
  };

  onGameFinished = () => {
    this.status = roomStatuses.NOT_PLAYING;
  };

  onUpdatePlayers = (players) => {
    this.players = players;
    this.setIsMyTurn();
  };

  onUpdateGame = ({ event, data, players }) => {
    if (players) {
      this.players = players;
    }

    this.emitter.emit(event, data);
    this.setIsMyTurn();
  };

  setIsMyTurn() {
    if (this.role === playerRoles.OBSERVER) {
      return;
    }

    const { login } = this.globals.user;

    this.isMyTurn = _.find(this.players, (player) => player && player.login === login).active;
  }

  toggleStatus = () => {
    this.socket.emit(TOGGLE_PLAYER_STATUS);
  };
}

Block.block('Room', Room.wrap(
  makeRoute()
));
