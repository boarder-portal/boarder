import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  survival_online: {
    events: {
      game: {
        HELLO,
        GET_INITIAL_INFO
      }
    },
    map: {
      width: mapW,
      height: mapH
    }
  }
} = gamesConfig;

class SurvivalGame extends Block {
  static template = template();

  constructor(opts) {
    super(opts);

    const {
      emitter,
      socket
    } = this.args;

    this.socket = socket;

    emitter.on(HELLO, this.onHello);
    emitter.on(GET_INITIAL_INFO, this.onGetInitialInfo);
  }

  afterConstruct() {
    this.watch('args.gameData', this.setup);
  }

  setup = () => {
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

  onGetInitialInfo({ map }) {
    console.log(map);
  }

  onHello = (data) => {
    console.log(data);
    this.emit(HELLO, 'Hello, Server!');
  };

  afterRender() {
    const ctx = this.ctx = this.canvas.getContext('2d');

    ctx.fillStyle = '#f00';
    ctx.fillRect(10, 10, 100, 100);
  }

  emit() {
    this.socket.emit(...arguments);
  }
}

Block.block('SurvivalGame', SurvivalGame);
