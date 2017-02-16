const _ = require('lodash');
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
      virusesShapes
    }
  }
} = require('../../config/constants.json');

const SHAPES = _.keys(virusesShapes);
const WIDTH = 10;
const HEIGHT = 10;

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
    this.field = _.times(HEIGHT, (y) => (
      _.times(WIDTH, (x) => ({
        x,
        y,
        ...this.virusCellSwitcher({ x, y }, this.players)
      }))
    ));
    this.players.forEach((player) => {
      player.score = 1;
    });
    this.players[0].active = true;
    this.setColors();
    this.setShapes();

    this.startGame();
  }

  setShapes() {
    const { players } = this;
    const shapes = _.shuffle(SHAPES);

    players.forEach((player, i) => {
      player.data.shape = shapes[i];
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
      const cellHost = players.find(({ login }) => cell.player === login);

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

  virusCellSwitcher({ x, y }, players) {
    /* eslint indent: 0 */
    switch (true) {
      case x === 0 && y === 0: {
        return {
          player: players[0].login,
          type: VIRUS
        };
      }

      case x === WIDTH - 1 && y === HEIGHT - 1: {
        return {
          player: players[1].login,
          type: VIRUS
        };
      }

      default: {
        return {
          player: null,
          type: null
        };
      }
    }
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
