const _ = require('lodash');
const Game = require('./');
const { getNeighbourCells } = require('../../shared/filler');
const {
  games: {
    filler: {
      events: {
        game: {
          CHOOSE_COLOR
        }
      },
      colors: colorsObject
    }
  }
} = require('../../config/constants.json');

const colors = _.keys(colorsObject);
const WIDTH = 10;
const HEIGHT = 6;
const WIDTH05 = _.round(WIDTH / 2);

/**
 * @class FillerGame
 * @extends Game
 * @public
 */
class FillerGame extends Game {
  static listeners = {
    [CHOOSE_COLOR]: {
      forActivePlayer: true,
      listener: 'onChooseColor'
    }
  };

  prepareGame() {
    super.prepareGame();

    const field = this.field = _.times(HEIGHT, (y) => (
      _.times(WIDTH, (x) => ({
        x,
        y,
        color: null
      }))
    ));
    const currentColors = this.currentColors = [];

    _.times(HEIGHT, (y) => {
      const y1 = HEIGHT - y - 1;

      _.times(WIDTH05, (x) => {
        const x1 = WIDTH - x - 1;
        const color = _.sample(colors);
        const topCell = field[y - 1] && field[y - 1][x];
        const leftCell = field[y][x - 1];
        const isTopLeft = x === 0 && y === 0;
        let isThereTopNeighbour;
        let isThereLeftNeighbour;
        let coords;
        let color1;

        if (topCell) {
          isThereTopNeighbour = true;

          if (topCell.color === color) {
            coords = {
              x,
              y: y - 1
            };
          }
        }

        if (leftCell) {
          isThereLeftNeighbour = true;

          if (leftCell.color === color) {
            coords = {
              x: x - 1,
              y
            };
          }
        }

        if (coords) {
          color1 = field[y + y1 - coords.y][x + x1 - coords.x].color;
        } else {
          const neighbourColors = [];

          if (isThereTopNeighbour) {
            neighbourColors.push(field[y1 + 1][x1].color);
          }

          if (isThereLeftNeighbour) {
            neighbourColors.push(field[y1][x1 + 1].color);
          }

          if (isTopLeft) {
            neighbourColors.push(color);
          }

          color1 = _(colors)
            .filter((color) => !neighbourColors.includes(color))
            .sample();

          if (isTopLeft) {
            currentColors.push(color, color1);
          }
        }

        field[y][x].color = color;
        field[y1][x1].color = color1;
      });
    });
    this.players[0].active = true;

    const mainCell = this.players[0].data.mainCell = field[0][0];
    const mainCell1 = this.players[1].data.mainCell = field[HEIGHT - 1][WIDTH - 1];

    this.players[0].cells = [mainCell];
    this.players[1].cells = [mainCell1];

    this.chooseColor(mainCell.color, this.players[0], true);
    this.chooseColor(mainCell1.color, this.players[1], true);
    this.startGame();
  }

  chooseColor(color, player, isFirst) {
    if (this.finished) {
      return;
    }

    const {
      currentColors,
      field
    } = this;

    const { x, y } = player.data.mainCell;
    const playerMainCell = field[y][x];
    const playerCells = player.cells;

    currentColors.splice(currentColors.indexOf(playerMainCell.color), 1);
    currentColors.push(color);

    let neighbourCells = getNeighbourCells(field, color, playerCells);

    if (isFirst) {
      neighbourCells = neighbourCells.filter((cell) => cell !== playerMainCell);
    }

    playerCells.forEach((cell) => {
      cell.color = color;
    });
    playerCells.push(...neighbourCells);

    player.score = playerCells.length;

    if (player.score > WIDTH05 * HEIGHT) {
      this.finished = true;

      setTimeout(() => {
        this.finishGame();
      }, 1000);
    }
  }

  onChooseColor(color, socket) {
    const { currentColors } = this;

    if (!colorsObject[color] || currentColors.includes(color)) {
      return;
    }

    const { player } = socket;

    this.chooseColor(color, player, false);
    this.changeTurn();
    this.emit(CHOOSE_COLOR, {
      currentColors,
      color,
      player
    }, true);
  }

  toJSON() {
    const { currentColors } = this;

    return {
      ...super.toJSON(),
      currentColors
    };
  }
}

module.exports = FillerGame;
