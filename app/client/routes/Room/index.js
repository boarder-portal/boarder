import io from 'socket.io-client';
import { D, Block, makeRoute, router } from 'dwayne';
import template from './index.pug';
import { Emitter } from '../../helper';
import { games as gamesConfig } from '../../../config/constants.json';

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

  playerRoles = playerRoles;
  roomStatuses = roomStatuses;

  constructor(opts) {
    super(opts);

    this.reset();
  }

  reset() {
    D(this).assign({
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
    socket.on(UPDATE_PLAYERS, this.onUpdatePlayers);
    socket.on(UPDATE_GAME, this.onUpdateGame);
    socket.on('connect', () => {
      console.log('connected to room');
    });
    socket.on('error', (err) => {
      console.log(err);

      if (err === 'Invalid namespace') {
        router.go('not-found', {
          query: {
            path: pathname
          }
        });

        return;
      }

      router.go('login');
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
    const { login } = this.global.user;

    this.roomData = roomData;
    this.ready = D(roomData.players).find((player) => player && player.login === login).value.ready;
  };

  onPreparingGame = () => {
    this.status = roomStatuses.PREPARING;
  };

  onGameStarted = (gameData) => {
    this.status = roomStatuses.PLAYING;
    this.startGame(gameData);
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
  };

  setIsMyTurn() {
    const { login } = this.global.user;

    this.isMyTurn = D(this.players).find((player) => player && player.login === login).value.active;
  }

  toggleStatus = () => {
    this.socket.emit(TOGGLE_PLAYER_STATUS);
  };
}

const wrap = Room
  .wrap(makeRoute());

Block.register('Room', wrap);
