import { D, Block } from 'dwayne';
import template from './index.pug';
import { getAvailableCells } from '../../../shared/virus-war';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  global: {
    events: {
      game: { END_TURN }
    }
  },
  virus_war: {
    events: {
      game: { SET_CELL }
    }
  }
} = gamesConfig;

class VirusWar extends Block {
  static template = template();

  constructor(opts) {
    super(opts);

    const gameData = this.args.gameData;
    const emitter = this.args.emitter;

    this.socket = this.args.socket;
    this.field = gameData.field;
    this.mapPlayersToColors = D(gameData.players).object((colors, { color, login }) => {
      colors[login] = color;
    }).$;
    this.mapPlayersToShapes = D(gameData.players).object((shapes, { data: { shape }, login }) => {
      shapes[login] = shape;
    }).$;
    this.isTopLeft = gameData.players[0].login === this.global.user.login;

    getAvailableCells(this.field, this.global.user).forEach((cell) => {
      console.log(cell);

      cell.isAvailable = true;
    });

    emitter.on(SET_CELL, this.setCell);

    console.log(gameData);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  onClickCell(cell) {
    if (!cell.isAvailable) {
      return;
    }

    this.emit(SET_CELL, {
      x: cell.x,
      y: cell.y
    });
  }

  endTurn = () => {
    if (!this.args.isMyTurn) {
      return;
    }

    this.emit(END_TURN);
  };

  setCell = (changedCell) => {
    const {
      field,
      global: { user }
    } = this;
    const { x, y } = changedCell;

    field[y][x] = changedCell;

    const availableCells = getAvailableCells(field, user);

    this.field = D(field).map((row) => (
      D(row).map((cell) => ({
        ...cell,
        isAvailable: availableCells.includes(cell)
      })).$
    )).$;
  };
}

Block.register('VirusWar', VirusWar);

export default VirusWar;
