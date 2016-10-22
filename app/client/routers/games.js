import io from 'socket.io-client';
import { D, Router, doc, parseHTML } from 'dwayne';
import BaseState from './base';
import LoginState from './login';
import GamesStateTemplate from '../views/states/games.pug';
import RoomRowTemplate from '../views/partials/room-row.pug';
import PlayerBeforeGameTemplate from '../views/partials/player-before-game.pug';
import ReadyToPlayBtnTemplate from '../views/partials/ready-btn.pug';
import { store } from '../constants';
import { games as gamesConfig } from '../../config/constants.json';

const {
  global: {
    playerRoles: {
      OBSERVER,
      PLAYER
    },
    playerStatuses: {
      READY
    },
    events: {
      lobby: {
        GET_LIST,
        NEW_ROOM,
        UPDATE_ROOM,
        DELETE_ROOM
      },
      room: {
        ENTER_ROOM,
        UPDATE_ROOM: UPDATE_ROOM_ITSELF,
        TOGGLE_PLAYER_STATUS
      }
    }
  }
} = gamesConfig;

class GamesState extends BaseState {
  static abstract = true;
  static stateName = 'games';
  static path = '/games';
  static template = GamesStateTemplate;

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

  getRoomData() {
    return [];
  }

  getRow(room) {
    const {
      i18n,
      roomState,
      templateParams: { gameName }
    } = this;
    const params = { roomId: room.id };

    return doc.tbody()
      .html(RoomRowTemplate({
        i18n,
        prefix: gameName,
        id: room.id,
        room: {
          name: room.name,
          status: room.status,
          players: room.players
        },
        roomData: this.getRoomData(),
        playLink: roomState.buildURL({
          params
        }),
        observeLink: roomState.buildURL({
          params,
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

  onEnterRoom(roomData) {
    console.log(roomData);

    const {
      dataToUpdate = roomData.room,
      role,
      observerCaption
    } = this;
    const eventualRole = roomData.role;

    D(this).assign({
      eventualRole
    });

    this.eventualRole = roomData.role;
    this.enteredRoom = true;

    if (role === PLAYER && eventualRole === OBSERVER) {
      observerCaption.removeClass('hidden');
    }

    this.onUpdateRoomItself(dataToUpdate);
  }

  onTryToUpdateRoom(roomData) {
    if (!this.enteredRoom) {
      this.dataToUpdate = roomData;

      return;
    }

    this.onUpdateRoomItself(roomData);
  }

  toggleStatus() {
    this.socket.emit(TOGGLE_PLAYER_STATUS);
  }

  onUpdateRoomItself(room) {
    const {
      i18n,
      eventualRole,
      playersBeforeGameList
    } = this;
    const { players } = room;

    playersBeforeGameList.html('');

    D(players).forEach((player) => {
      if (player) {
        player.ready = player.status === READY;
      }

      parseHTML(
        PlayerBeforeGameTemplate({
          i18n,
          player
        })
      ).into(playersBeforeGameList);
    });

    if (eventualRole === PLAYER) {
      const newBtn = parseHTML(
        ReadyToPlayBtnTemplate({
          i18n,
          ready: D(players).find((player) => player && player.login === store.user.login).value.ready
        })
      );

      this.readyToPlayBtn.replace(newBtn);
      newBtn.removeClass('not-visible');
      newBtn.on('click', this.toggleStatus.bind(this));

      this.readyToPlayBtn = newBtn;
    }
  }

  onBeforeLoad(e) {
    if (!store.user) {
      e.go(LoginState.buildURL());
    }
  }
}

Router.on('init', () => {
  GamesState.on({
    beforeLoad(e) {
      const {
        state,
        state: { nsp }
      } = e;

      const socket = state.socket = io(nsp, {
        forceNew: true
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
      state.rendered = true;

      state.renderRoomsList();
    }
  }, /lobby$/);

  GamesState.on({
    beforeLoad(e) {
      const {
        state,
        state: { nsp }
      } = e;
      const {
        params: { roomId },
        query: { observe }
      } = state;
      const socket = state.socket = io(nsp.replace(/\$roomId/, roomId), {
        forceNew: true,
        query: { role: observe ? 'observer' : '' }
      });

      D(state).assign({
        role: observe ? OBSERVER : PLAYER
      });

      socket.on(ENTER_ROOM, state.onEnterRoom.bind(state));
      socket.on(UPDATE_ROOM_ITSELF, state.onTryToUpdateRoom.bind(state));
      socket.on('connect', () => {
        e.continue();

        console.log('connected');
      });
      socket.on('error', (err) => {
        console.log(err);

        if (err === 'Invalid namespace') {
          e.stop();

          return;
        }

        e.go(LoginState.buildURL());
      });
      socket.on('disconnect', () => {
        console.log('disconnected');
      });

      e.pause();
    },
    leave({ state }) {
      state.socket.disconnect();
    }
  }, /room$/);
});

export default GamesState;
