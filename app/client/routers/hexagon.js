import io from 'socket.io-client';
import { D, Router } from 'dwayne';
import GamesState from './games';
import HexagonStateTemplate from '../views/states/hexagon.pug';
import { io as ioConfig } from '../../config/constants.json';

const { hexagonNsp } = ioConfig;

class HexagonState extends GamesState {
  static stateName = 'hexagon';
  static path = '/hexagon';
  static template = HexagonStateTemplate;

  onLoad() {
    const socket = this.socket = io(hexagonNsp);

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
