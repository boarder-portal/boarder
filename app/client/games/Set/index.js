import { D, Block } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  set: {
    events: {
      game: {
        FIND_SET,
        SET_FOUND,
        NO_SET_HERE,
        ADD_CARDS
      }
    }
  }
} = gamesConfig;

class SetGame extends Block {
  static template = template();

  constructor(opts) {
    super(opts);

    const gameData = this.args.gameData;
    const emitter = this.args.emitter;

    this.socket = this.args.socket;
    this.setup();

    emitter.on(SET_FOUND, this.onSetFound);
    emitter.on(ADD_CARDS, this.onAddCards);
  }

  afterConstruct() {
    this.watchArgs('gameData', this.setup);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  setup = () => {
    const { gameData } = this.args;

    if (!gameData) {
      return;
    }
  };

  onSetFound = (cards) => {

  };

  onAddCards = (cards) => {

  };
}

Block.register('SetGame', SetGame);
