import _ from 'lodash';
import { Block } from 'dwayne';

class Game extends Block {
  constructor(opts) {
    super(opts);

    const {
      gameData,
      emitter,
      socket
    } = this.args;
    const { constructor } = Object.getPrototypeOf(this);

    this.socket = socket;
    this.emitter = emitter;
    this.gameData = gameData;

    _.forEach(constructor.listeners, (listener, event) => {
      emitter.on(event, this[listener]);
    });
  }

  afterConstruct() {
    this.watch('args.gameData', this.setup);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  setup() {}
}

export default Game;
