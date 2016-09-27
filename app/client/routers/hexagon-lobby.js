import io from 'socket.io-client';
import { D, Router, doc, isNull } from 'dwayne';
import HexagonState from './hexagon';
import HexagonRoomState from './hexagon-room';
import LoginState from './login';
import HexagonLobbyStateTemplate from '../views/states/hexagon-lobby.pug';
import RoomRowTemplate from '../views/partials/room-row.pug';
import { games as gamesConfig } from '../../config/constants.json';

const {
  hexagon: { lobbyNsp }
} = gamesConfig;

class HexagonLobbyState extends HexagonState {
  static stateName = 'hexagon-lobby';
  static path = '/';
  static template = HexagonLobbyStateTemplate;
  static templateParams = {
    createRoomCaption: 'Create room'
  };

  constructor(props) {
    super(props);
    D(this).assign({
      roomsToRender: {},
      roomsToAdd: [],
      roomsToUpdate: [],
      roomsToDelete: []
    });
  }

  onBeforeLoad(e) {
    const socket = this.socket = io(lobbyNsp);

    socket.on('connect', () => {
      e.continue();

      console.log('connected');

      socket.on('rooms/list', this.onListReceived.bind(this));
      socket.on('room/new', this.onNewRoom.bind(this));
      socket.on('room/update', this.onUpdateRoom.bind(this));
      socket.on('room/delete', this.onDeleteRoom.bind(this));
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
    this.socket.emit('room/new');
  }

  onEnterRoom({ target }) {
    target = D(target);

    const { socket } = this;

    const row = target.closest('.hexagon-room');

    socket.emit('room/enter', row.data('roomId'));
  }

  onListReceived(rooms) {
    this.listReceived = true;
    this.roomsToRender = rooms;

    this.renderRoomsList();
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
      .assign(roomsToAdd)
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

  findRoom(id) {
    return this.rooms
      .find(`#room-${ id }`);
  }

  getRow(room) {
    return doc.tbody()
      .html(RoomRowTemplate({
        prefix: 'hexagon',
        id: room.id,
        room: [
          {
            name: 'name',
            value: room.name
          },
          {
            name: 'status',
            value: room.status
          },
          {
            name: 'players',
            value: room.playersCount - D(room.players).sum(isNull)
          }
        ],
        link: HexagonRoomState.buildURL({
          params: { roomId: room.id }
        })
      }))
      .children();
  }

  addRoom(room) {
    const { rooms } = this;

    this.getRow(room)
      .into(rooms);
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

  onDeleteRoom(id) {
    if (!this.listRendered) {
      return this.roomsToDelete.push(id);
    }

    this.findRoom(id)
      .remove();
  }

  onRender() {
    const { base } = this;
    const createRoomBtn = base.find('.create-room-btn');
    const rooms = base.find('.hexagon-rooms');

    D(this).assign({
      rooms,
      rendered: true
    });

    createRoomBtn.on('click', this.onCreateRoomClick.bind(this));
    rooms.on('click', '.enter-room', this.onEnterRoom.bind(this));

    this.renderRoomsList({});
  }

  onLeave() {
    this.socket.disconnect();
  }
}

Router.on('init', () => {
  D(Router.templateParams).deepAssign({
    urls: {
      hexagon: HexagonLobbyState.buildURL()
    }
  });
});

export default HexagonLobbyState;
