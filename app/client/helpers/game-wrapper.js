export function gameWrapper(Block) {
  return class extends Block {
    constructor(opts) {
      super(opts);

      const {
        gameData,
        emitter,
        socket
      } = this.args;

      this.socket = socket;
      this.emitter = emitter;
      this.gameData = gameData;

      _.forEach(Block.listeners, (listener, event) => {
        emitter.on(event, this[listener].bind(this));
      });
    }

    afterConstruct() {
      this.watch('args.gameData', () => this.setupGame());
    }

    emit() {
      this.socket.emit(...arguments);
    }

    setupGame() {
      if (this.setup) {
        this.setup();
      }
    }
  };
}
