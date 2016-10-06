import io from 'socket.io-client';
import { D, doc } from 'dwayne';
import BaseState from './base';
import LoginState from './login';
import GamesStateTemplate from '../views/states/games.pug';
import RoomRowTemplate from '../views/partials/room-row.pug';
import { store } from '../constants';
import { games as gamesConfig } from '../../config/constants.json';

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
  }
} = gamesConfig;

class GamesState extends BaseState {
  static abstract = true;
  static stateName = 'games';
  static path = '/games';
  static template = GamesStateTemplate;
  static elements = {
    rooms: '.rooms',
    createRoomBtn: '.create-room-btn'
  };

  roomsToAdd = [];
  roomsToDelete = [];
  roomsToRender = [];
  roomsToUpdate = [];

  addRoom(room) {
    const { rooms } = this;

    this.getRow(room)
      .into(rooms);
  }

  findRoom(id) {
    return this.rooms
      .find(`#room-${ id }`);
  }

  getRow(room) {
    const {
      roomState,
      templateParams: { gameName }
    } = this;

    return doc.tbody()
      .html(RoomRowTemplate({
        prefix: gameName,
        id: room.id,
        room: this.getRoomData(room),
        playLink: roomState.buildURL({
          params: { roomId: room.id }
        }),
        observeLink: roomState.buildURL({
          params: { roomId: room.id },
          query: { observe: true }
        })
      }))
      .children();
  }

  onCreateRoomClick() {
    this.socket.emit(NEW_ROOM);
  }

  onDeleteRoom(id) {
    if (!this.listRendered) {
      return this.roomsToDelete.push(id);
    }

    this.findRoom(id)
      .remove();
  }

  onListReceived(rooms) {
    this.listReceived = true;
    this.roomsToRender = rooms;

    this.renderRoomsList();
  }

  onNewRoom(room) {
    if (!this.listRendered) {
      this.roomsToAdd[room.id] = room;

      return;
    }

    this.addRoom(room);
  }

  onUpdateRoom(room) {
    if (!this.listRendered) {
      return this.roomsToUpdate.push(room);
    }

    this.findRoom(room.id)
      .replace(this.getRow(room));
  }

  renderRoomsList() {
    const {
      rendered,
      listReceived,
      listRendered,
      roomsToRender,
      roomsToAdd,
      roomsToUpdate,
      roomsToDelete
    } = this;

    if (!listReceived || !rendered || listRendered) {
      return;
    }

    D(roomsToRender)
      .concat(roomsToAdd)
      .forEach((room) => {
        this.addRoom(room);
      });

    D(roomsToUpdate).forEach((room) => {
      this.onUpdateRoom(room);
    });

    D(roomsToDelete).forEach((id) => {
      this.onDeleteRoom(id);
    });

    this.listRendered = true;
  }

  onBeforeLoad(e) {
    if (!store.user) {
      e.go(LoginState.buildURL());
    }
  }
}

GamesState.on({
  beforeLoad(e) {
    const {
      state,
      state: {
        forceNew,
        nsp
      }
    } = e;

    const socket = state.socket = io(nsp, {
      forceNew
    });

    socket.on(GET_LIST, state.onListReceived.bind(state));
    socket.on(NEW_ROOM, state.onNewRoom.bind(state));
    socket.on(UPDATE_ROOM, state.onUpdateRoom.bind(state));
    socket.on(DELETE_ROOM, state.onDeleteRoom.bind(state));
    socket.on('connect', () => {
      e.continue();

      console.log('connected');
    });
    socket.on('error', (err) => {
      e.go(LoginState.buildURL());

      console.log(err);
    });
    socket.on('disconnect', () => {
      console.log('disconnected');
    });

    e.pause();
  },
  leave({ state }) {
    state.socket.disconnect();
  },
  render({ state }) {
    const { createRoomBtn } = state;

    state.rendered = true;

    createRoomBtn.on('click', state.onCreateRoomClick.bind(state));

    state.renderRoomsList();
  }
}, /lobby$/);

export default GamesState;
