import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import Game from '../';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  survival_online: {
    events: {
      game: {
        GET_INITIAL_INFO
      }
    },
    map: {
      width: mapW,
      height: mapH
    }
  }
} = gamesConfig;

class SurvivalGame extends Game {
  static template = template();
  static listeners = {
    // [GET_INITIAL_INFO]: 'onGetInitialInfo'
  };

  constructor(opts) {
    super(opts);

    /*
    const {
      emitter,
      socket
    } = this;
    */

    const {
      emitter,
      socket
    } = this.args;

    this.socket = socket;

    socket.on(GET_INITIAL_INFO, this.onGetInitialInfo);
  }

  setup = () => {
    this.emit(GET_INITIAL_INFO);

    this.map = this.map || _.times(mapH, (y) => {
      return _.times(mapW, (x) => {
        return {
          x,
          y,
          land: 'grass',
          building: null,
          creature: null
        }
      });
    });
  };

  onGetInitialInfo({ playerMap }) {
    _.forEach(playerMap, (cell) => {
      this.map[cell.y][cell.x] = cell;
    });
  }

  renderMap(cornerX, cornerY) {

  }

  afterRender() {
    this.ctx = this.canvas.getContext('2d');
  }
}

Block.block('SurvivalGame', SurvivalGame);
