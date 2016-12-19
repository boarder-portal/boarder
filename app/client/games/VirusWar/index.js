import { D, Block } from 'dwayne';
import template from './index.pug';
import { toRGBA } from '../../helper';
import { getAvailableCells } from '../../../shared/virus-war';
import { games as gamesConfig, colors } from '../../../config/constants.json';

const {
  global: {
    events: {
      game: { END_TURN }
    }
  },
  virus_war: {
    events: {
      game: { SET_CELL }
    },
    virusesTypes: { VIRUS }
  }
} = gamesConfig;

class VirusWar extends Block {
  static template = template();

  colors = colors;

  constructor(opts) {
    super(opts);

    const gameData = this.args.gameData;
    const emitter = this.args.emitter;

    this.socket = this.args.socket;
    this.field = gameData.field;
    this.lastSetCells = D(gameData.lastSetCells);
    this.mapPlayersToColors = D(gameData.players).object((colors, { color, login }) => {
      colors[login] = color;
    }).$;
    this.mapPlayersToShapes = D(gameData.players).object((shapes, { data: { shape }, login }) => {
      shapes[login] = shape;
    }).$;
    this.isTopLeft = gameData.players[0].login === this.global.user.login;

    this.lastSetCells.forEach(({ x, y }) => {
      this.field[y][x].isAmongLastSetCells = true;
    });
    getAvailableCells(this.field, this.global.user, this.lastSetCells).forEach((cell) => {
      cell.isAvailable = true;
    });

    emitter.on(SET_CELL, this.onSetCell);
    emitter.on(END_TURN, this.onEndTurn);

    console.log(gameData);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  setCell(cell) {
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

  refreshField(isLast) {
    const {
      field,
      args: { isMyTurn },
      global: { user }
    } = this;

    if (isLast && !isMyTurn) {
      this.lastSetCells = D([]);
    }

    const availableCells = getAvailableCells(field, user, this.lastSetCells);

    if (isLast && isMyTurn) {
      this.lastSetCells = D([]);
    }

    this.field = D(field).map((row) => (
      D(row).map((cell) => ({
        ...cell,
        isAvailable: availableCells.includes(cell),
        isAmongLastSetCells: this.lastSetCells.some(({ x, y }) => cell.x === x && cell.y === y)
      })).$
    )).$;
  }

  onEndTurn = () => {
    this.refreshField(true);
  };

  onSetCell = ({ cell: changedCell, isLast }) => {
    const {
      field,
      lastSetCells
    } = this;
    const { x, y } = changedCell;

    field[y][x] = changedCell;

    if (changedCell.type === VIRUS) {
      lastSetCells.push(changedCell);
    }

    this.refreshField(isLast);
  };

  toRGBA(color) {
    return toRGBA(color, 0.25);
  }
}

Block.register('VirusWar', VirusWar);

export default VirusWar;