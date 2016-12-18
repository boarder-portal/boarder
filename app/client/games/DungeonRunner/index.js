import { D, Block } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  dungeon_runner: {
    events: {
      game: {
        CHANGE_BUTTON_STATUS
      }
    }
  }
} = gamesConfig;

class DungeonRunner extends Block {
  static template = template();
  constructor(opts) {
    super(opts);

    console.log(this.args.players);

    const gameData = this.args.gameData;
    const emitter = this.args.emitter;

    this.socket = this.args.socket;
    this.field = gameData.field;
    this.turn = gameData.turn;
    this.currentTurnedCards = gameData.currentTurnedCards;
    this.loaded = 0;
    this.match = gameData.match;
    this.options = gameData.options;
    this.isButtonOn = gameData.isButtonOn;

    emitter.on(CHANGE_BUTTON_STATUS, this.onChangeButtonStatus);
  }

  afterRender() {
    console.log(this.myLovelyCanvas);

    const myLovelyCanvas = this.myLovelyCanvas;

    myLovelyCanvas
      .ctx('fillStyle', 'red')
      .fillRect(10, 10, 40, 40);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  changeButtonStatus() {
    this.emit(CHANGE_BUTTON_STATUS, { loco: 1 });
  }

  onChangeButtonStatus = ({ buttonStatus }) => {
    this.isButtonOn = buttonStatus;
  }
}

Block.register('DungeonRunner', DungeonRunner);
