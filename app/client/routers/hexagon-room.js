import io from 'socket.io-client';
import { D } from 'dwayne';
import HexagonState from './hexagon';
import LoginState from './login';
import HexagonRoomStateTemplate from '../views/states/hexagon-room.pug';
import { io as ioConfig } from '../../config/constants.json';

const { hexagonRoomNsp } = ioConfig;

class HexagonRoomState extends HexagonState {
  static stateName = 'hexagon-room';
  static path = '/:roomId';
  static template = HexagonRoomStateTemplate;
  static templateParams = {};

  onBeforeLoad(e) {
    const {
      params: { roomId }
    } = this;

    const socket = this.socket = io(hexagonRoomNsp.replace(/\$roomId/, roomId));

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

  onRender() {

  }

  onLeave() {
    this.socket.disconnect();
  }
}

export default HexagonRoomState;
