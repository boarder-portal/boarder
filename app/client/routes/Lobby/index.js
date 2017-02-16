import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import io from 'socket.io-client';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  global: {
    events: {
      lobby: {
        GET_LIST,
        NEW_ROOM,
        UPDATE_ROOM,
        DELETE_ROOM
      }
    }
  },
  pexeso: {
    sets: pexesoSets
  }
} = gamesConfig;

class Lobby extends Block {
  static template = template();
  static routerOptions = {
    name: 'lobby',
    parent: 'game'
  };

  pexesoSets = pexesoSets;

  constructor(opts) {
    super(opts);

    this.reset();
  }

  reset() {
    this.rooms = {};
    this.gameName = '';
    this.pexesoChosenSet = 'lost';
  }

  beforeLoadRoute() {
    const { game } = this.args.route.params;
    const nsp = gamesConfig[game].LOBBY_NSP;
    const socket = this.socket = io(nsp, {
      forceNew: true
    });

    this.gameName = game;

    socket.on(GET_LIST, this.onListReceived);
    socket.on(NEW_ROOM, this.onNewRoom);
    socket.on(UPDATE_ROOM, this.onUpdateRoom);
    socket.on(DELETE_ROOM, this.onDeleteRoom);
    socket.on('connect', () => {
      console.log('connected to lobby');
    });
    socket.on('error', (err) => {
      this.router.go('login');

      console.log(err);
    });
    socket.on('disconnect', () => {
      console.log('disconnected from lobby');
    });

    setTimeout(() => {
      this.title.text(this.i18n.t(`games.${ game }_caption`));
    }, 0);
  }

  beforeLeaveRoute() {
    this.socket.disconnect();
    this.reset();
  }

  constructPlayLink(room) {
    return this.router.buildURL('room', {
      params: {
        game: this.gameName,
        roomId: room.id
      }
    });
  }

  constructObserveLink(room) {
    return this.router.buildURL('room', {
      params: {
        game: this.gameName,
        roomId: room.id
      },
      query: { observe: true }
    });
  }

  getRoomOptions() {
    const {
      gameName,
      pexesoChosenSet
    } = this;

    /* eslint indent: 0 */
    switch (gameName) {
      case 'pexeso': {
        return {
          set: pexesoChosenSet
        };
      }

      default: {
        return {};
      }
    }
  }

  onCreateRoomClick = () => {
    this.socket.emit(NEW_ROOM, this.getRoomOptions());
  };

  onListReceived = (rooms) => {
    this.rooms = rooms;
  };

  onNewRoom = (room) => {
    this.rooms = {
      ...this.rooms,
      [room.id]: room
    };
  };

  onUpdateRoom = (room) => {
    this.rooms = {
      ...this.rooms,
      [room.id]: room
    };
  };

  onDeleteRoom = (id) => {
    this.rooms = _.omit(this.rooms, id);
  };
}

Block.block('Lobby', Lobby.wrap(
  makeRoute()
));
