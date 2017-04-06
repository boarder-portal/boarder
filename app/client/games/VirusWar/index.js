import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import Game from '../';
import { toRGBA } from '../../helpers';
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

class VirusWar extends Game {
  static template = template();
  static listeners = {
    [SET_CELL]: 'onSetCell',
    [END_TURN]: 'onEndTurn'
  };

  colors = colors;

  constructor(opts) {
    super(opts);

    const { gameData } = this;

    this.mapPlayersToColors = _(gameData.players)
      .map(({ color, login }) => [login, color])
      .fromPairs()
      .value();
    this.mapPlayersToShapes = _(gameData.players)
      .map(({ data: { shape }, login }) => [login, shape])
      .fromPairs()
      .value();
    this.isTopLeft = gameData.players[0].login === this.globals.user.login;
  }

  setup = () => {
    const { gameData } = this.args;

    if (!gameData) {
      return;
    }

    this.field = gameData.field;
    this.lastSetCells = gameData.lastSetCells;

    _.forEach(this.lastSetCells, ({ x, y }) => {
      this.field[y][x].isAmongLastSetCells = true;
    });
    _.forEach(getAvailableCells(this.field, this.globals.user, this.lastSetCells), (cell) => {
      cell.isAvailable = true;
    });
  };

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
      globals: { user }
    } = this;

    if (isLast && !isMyTurn) {
      this.lastSetCells = [];
    }

    const availableCells = getAvailableCells(field, user, this.lastSetCells);

    if (isLast && isMyTurn) {
      this.lastSetCells = [];
    }

    this.field = _.map(field, (row) => (
      _.map(row, (cell) => ({
        ...cell,
        isAvailable: _.includes(availableCells, cell),
        isAmongLastSetCells: _.some(this.lastSetCells, ({ x, y }) => cell.x === x && cell.y === y)
      }))
    ));
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

Block.block('VirusWar', VirusWar);

export default VirusWar;
