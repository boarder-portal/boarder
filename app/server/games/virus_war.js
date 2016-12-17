const D = require('dwayne');
const Game = require('./');
const { getAvailableCells } = require('../../shared/virus-war');
const {
  games: {
    global: {
      events: {
        game: { END_TURN }
      }
    },
    virus_war: {
      events: {
        game: { SET_CELL }
      },
      virusesTypes: {
        VIRUS,
        FORTRESS
      },
      virusesShapes: shapesObject
    }
  }
} = require('../../config/constants.json');

const {
  array,
  switcher
} = D;

const shapes = D(shapesObject).keys();
const width = 10;
const height = 10;

const virusCellSwitcher = switcher('call', {
  player: null,
  type: null
})
  .case(({ x, y }) => x === 0 && y === 0, (players) => ({
    player: players.$[0].login,
    type: VIRUS
  }))
  .case(({ x, y }) => x === width - 1 && y === height - 1, (players) => ({
    player: players.$[1].login,
    type: VIRUS
  }));

/**
 * @class VirusWarGame
 * @extends Game
 * @public
 */
class VirusWarGame extends Game {
  static listeners = {
    [SET_CELL]: {
      forActivePlayer: true,
      listener: 'onSetCell'
    },
    [END_TURN]: {
      forActivePlayer: true,
      listener: 'onEndTurn'
    }
  };

  prepareGame() {
    super.prepareGame();

    this.lastSetCells = [];
    this.field = array(height, (y) => (
      array(width, (x) => ({
        x,
        y,
        ...virusCellSwitcher({ x, y }, [this.players])
      })).$
    )).$;
    this.players.forEach((player) => {
      player.score = 1;
    });
    this.players.$[0].active = true;
    this.setColors();
    this.setShapes();

    this.startGame();
  }

  setShapes() {
    const { players } = this;
    const newShapes = shapes
      .slice(0, this.players.length)
      .shuffle()
      .$;

    players.forEach((player, i) => {
      player.data.shape = newShapes[i];
    });
  }

  onSetCell({ x, y }, socket) {
    const {
      field,
      lastSetCells,
      players
    } = this;
    const { player } = socket;
    const availableCells = getAvailableCells(field, player, lastSetCells);
    const cell = field[y][x];
    let isLast;

    if (!availableCells.includes(cell)) {
      return;
    }

    if (cell.player && cell.type === VIRUS) {
      const cellHost = players.find(({ login }) => cell.player === login).value;

      cellHost.score--;

      cell.type = FORTRESS;
      cell.player = player.login;
    } else if (!cell.type) {
      socket.player.score++;

      cell.type = VIRUS;
      cell.player = player.login;

      lastSetCells.push(cell);
    }

    if (!getAvailableCells(field, player, lastSetCells).length) {
      isLast = true;
      this.endTurn();
    }

    this.emit(SET_CELL, {
      cell,
      isLast
    }, true);
  }

  endTurn() {
    this.lastSetCells = [];
    this.changeTurn();
  }

  onEndTurn() {
    this.endTurn();
    this.emit(END_TURN, {}, true);
  }

  toJSON() {
    const { lastSetCells } = this;

    return {
      ...super.toJSON(),
      lastSetCells
    };
  }
}

module.exports = VirusWarGame;
