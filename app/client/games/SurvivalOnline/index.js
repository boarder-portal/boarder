import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  filler: {
    events: {
      game: {
        HELLO
      }
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
  }

  afterConstruct() {
    this.watch('args.gameData', this.setup);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  setup = () => {

  };

  onHello = (data) => {
    console.log(data);
    this.emit(HELLO, 'Hello, Server!');
  };

  afterRender() {
    const ctx = this.ctx = this.canvas.getContext('2d');

    ctx.fillStyle = '#f00';
    ctx.fillRect(10, 10, 100, 100);
  }
}

Block.block('SurvivalGame', SurvivalGame);
