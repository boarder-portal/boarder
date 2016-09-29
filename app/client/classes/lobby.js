import io from 'socket.io-client';
import { D, doc } from 'dwayne';
import LoginState from '../routers/login';
import LobbyTemplate from '../views/partials/lobby.pug';
import RoomRowTemplate from '../views/partials/room-row.pug';
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

class Lobby {
  static template = LobbyTemplate;
  static templateParams = {
    createRoomCaption: 'Create room'
  };

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

  onBeforeLoad(e) {
    D(this).assign({
      roomsToRender: [],
      roomsToAdd: [],
      roomsToUpdate: [],
      roomsToDelete: []
    });

    const {
      forceNew,
      nsp
    } = this;

    const socket = this.socket = io(nsp, {
      forceNew
    });

    socket.on(GET_LIST, this.onListReceived.bind(this));
    socket.on(NEW_ROOM, this.onNewRoom.bind(this));
    socket.on(UPDATE_ROOM, this.onUpdateRoom.bind(this));
    socket.on(DELETE_ROOM, this.onDeleteRoom.bind(this));
    socket.on('connect', () => {
      e.continue();

      console.log('connected');
    });
    socket.on('error', (err) => {
      e.stop();

      D(0)
        .timeout()
        .then(() => LoginState.go());

      console.log(err);
    });
    socket.on('disconnect', () => {
      console.log('disconnected');
    });

    e.pause();
  }

  onCreateRoomClick() {
    this.socket.emit(NEW_ROOM);
  }

  onLeave() {
    this.socket.disconnect();
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

  onRender() {
    const { base } = this;
    const createRoomBtn = base.find('.create-room-btn');
    const rooms = base.find('.rooms');

    D(this).assign({
      rooms,
      rendered: true
    });

    createRoomBtn.on('click', this.onCreateRoomClick.bind(this));

    this.renderRoomsList({});
  }

  onUpdateRoom(room) {
    if (!this.listRendered) {
      return this.roomsToUpdate.push(room);
    }

    this.findRoom(room.id)
      .replace(this.getRow(room));
  }

  onDeleteRoom(id) {
    if (!this.listRendered) {
      return this.roomsToDelete.push(id);
    }

    this.findRoom(id)
      .remove();
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
}

export default Lobby;
