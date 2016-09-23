import io from 'socket.io-client';
import { D, Router } from 'dwayne';
import GamesState from './games';
import HexagonStateTemplate from '../views/states/hexagon.pug';
import { io as ioConfig } from '../../config/constants.json';

const { hexagonLobbyNsp } = ioConfig;
const stateName = 'hexagon';

class HexagonState extends GamesState {
  static stateName = stateName;
  static path = '/hexagon';
  static template = HexagonStateTemplate;

  onLoad() {
    if (this.name !== stateName) {
      return;
    }

    const socket = this.socket = io(hexagonLobbyNsp);

    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('disconnect', () => {
      console.log('disconnected');
    });
  }

  onLeave() {
    this.socket.disconnect();
  }
}

Router.on('init', () => {
  D(Router.templateParams).deepAssign({
    urls: {
      hexagon: HexagonState.buildURL()
    }
  });
});

export default HexagonState;
