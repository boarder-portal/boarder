import io from 'socket.io-client';
import { D } from 'dwayne';
import HexagonState from './hexagon';
import LoginState from './login';
import HexagonRoomStateTemplate from '../views/states/hexagon-room.pug';
import { games as gamesConfig } from '../../config/constants.json';

const {
  hexagon: { roomNsp }
} = gamesConfig;

class HexagonRoomState extends HexagonState {
  static stateName = 'hexagon-room';
  static path = '/:roomId';
  static template = HexagonRoomStateTemplate;
  static templateParams = {
    observerCaption: 'You can only observe the game'
  };

  onBeforeLoad(e) {
    const {
      params: { roomId }
    } = this;

    const socket = this.socket = io(roomNsp.replace(/\$roomId/, roomId));

    window.socket = socket;

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

  onRender() {
    const {
      // base,
      socket
    } = this;

    socket.on('room/enter', this.onEnterRoom.bind(this));
  }

  onLeave() {
    this.socket.disconnect();
  }
}

export default HexagonRoomState;
