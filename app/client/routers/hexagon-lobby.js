import io from 'socket.io-client';
import { D, Router, doc } from 'dwayne';
import HexagonState from './hexagon';
import HexagonRoomState from './hexagon-room';
import LoginState from './login';
import HexagonLobbyStateTemplate from '../views/states/hexagon-lobby.pug';
import RoomRowTemplate from '../views/partials/room-row.pug';
import { io as ioConfig } from '../../config/constants.json';

const { hexagonLobbyNsp } = ioConfig;

class HexagonLobbyState extends HexagonState {
  static stateName = 'hexagon-lobby';
  static path = '/';
  static template = HexagonLobbyStateTemplate;
  static templateParams = {
    createRoomCaption: 'Create room'
  };

  onBeforeLoad(e) {
    const socket = this.socket = io(hexagonLobbyNsp);

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
    this.socket.emit('room/new');
  }

  onEnterRoom({ target }) {
    target = D(target);

    const { socket } = this;

    const row = target.closest('.hexagon-room');

    socket.emit('room/enter', row.data('roomId'));
  }

  renderRoomsList(rooms) {
    D(rooms).forEach((room) => {
      this.addRoom(room);
    });
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
            value: room.players.length
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
    this.addRoom(room);
  }

  onUpdateRoom(room) {
    this.findRoom(room.id)
      .replace(this.getRow(room));
  }

  onDeleteRoom(id) {
    this.findRoom(id)
      .remove();
  }

  onRender() {
    const {
      base,
      socket
    } = this;
    const createRoomBtn = base.find('.create-room-btn');
    const rooms = base.find('.hexagon-rooms');

    D(this).assign({
      rooms
    });

    createRoomBtn.on('click', this.onCreateRoomClick.bind(this));
    rooms.on('click', '.enter-room', this.onEnterRoom.bind(this));

    socket.on('rooms/list', this.renderRoomsList.bind(this));
    socket.on('room/new', this.onNewRoom.bind(this));
    socket.on('room/update', this.onUpdateRoom.bind(this));
    socket.on('room/delete', this.onDeleteRoom.bind(this));
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
