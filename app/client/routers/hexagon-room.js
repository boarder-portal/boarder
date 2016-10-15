import io from 'socket.io-client';
import { D } from 'dwayne';
import HexagonState from './hexagon';
import LoginState from './login';
import HexagonRoomStateTemplate from '../views/states/hexagon-room.pug';
import { games as gamesConfig } from '../../config/constants.json';

const {
  global: {
    events: {
      room: {
        ENTER_ROOM
      }
    }
  },
  hexagon: { ROOM_NSP }
} = gamesConfig;

class HexagonRoomState extends HexagonState {
  static stateName = 'hexagon-room';
  static path = '/:roomId';
  static template = HexagonRoomStateTemplate;

  onBeforeLoad(e) {
    const {
      params: { roomId },
      query: { observe }
    } = this;

    const socket = this.socket = io(ROOM_NSP.replace(/\$roomId/, roomId), {
      forceNew: true,
      query: { role: observe ? 'observer' : '' }
    });

    socket.on(ENTER_ROOM, this.onEnterRoom.bind(this));
    socket.on('connect', () => {
      e.continue();

      console.log('connected');
    });
    socket.on('error', (err) => {
      console.log(err);

      e.stop();

      if (err === 'Invalid namespace') {
        return;
      }

      D(0)
        .timeout()
        .then(() => LoginState.go());
    });
    socket.on('disconnect', () => {
      console.log('disconnected');
    });

    e.pause();
  }

  onEnterRoom(roomData) {
    console.log(roomData);
  }

  renderRoom() {

  }

  onRender() {

  }

  onLeave() {
    this.socket.disconnect();
  }
}

export default HexagonRoomState;
