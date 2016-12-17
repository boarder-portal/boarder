let D = require('dwayne');
const {
  games: {
    virus_war: {
      virusesTypes: {
        VIRUS,
        FORTRESS
      }
    }
  }
} = require('../config/constants.json');

D = D.D || D;

const { switcher } = D;
const availableCellsSwitcher = switcher()
  .case(VIRUS, (availableCells, availableNeighbours) => {
    availableCells.push(...availableNeighbours);
  })
  .case(FORTRESS, (availableCells, availableNeighbours, neighbours, login) => {
    if (neighbours.some(({ player, type }) => type === VIRUS && player === login)) {
      availableCells.push(...availableNeighbours);
    }
  });

exports.getAvailableCells = (field, player) => {
  const { login } = player;
  const availableCells = D([]);

  D(field).forEach((row) => {
    D(row).forEach((cell) => {
      if (cell.player !== login) {
        return;
      }

      const neighbours = getNeighbours(cell, field);
      const availableNeighbours = neighbours.filter((cell) => (
        !cell.player || (
          cell.player !== login
          && cell.type === VIRUS
        )
      )).$;

      availableCellsSwitcher(cell.type, [availableCells, availableNeighbours, neighbours, login]);
    });
  });

  return availableCells;
};

function getNeighbours(cell, field) {
  const { x, y } = cell;
  const neighbours = D([]);
  const row = field[y];
  const topRow = field[y - 1];
  const bottomRow = field[y + 1];
  const left = row[x - 1];
  const right = row[x + 1];

  if (left) {
    neighbours.push(left);
  }

  if (right) {
    neighbours.push(right);
  }

  if (topRow) {
    const topLeft = topRow[x - 1];
    const top = topRow[x];
    const topRight = topRow[x + 1];

    if (topLeft) {
      neighbours.push(topLeft);
    }

    if (top) {
      neighbours.push(top);
    }

    if (topRight) {
      neighbours.push(topRight);
    }
  }

  if (bottomRow) {
    const bottomLeft = bottomRow[x - 1];
    const bottom = bottomRow[x];
    const bottomRight = bottomRow[x + 1];

    if (bottomLeft) {
      neighbours.push(bottomLeft);
    }

    if (bottom) {
      neighbours.push(bottom);
    }

    if (bottomRight) {
      neighbours.push(bottomRight);
    }
  }

  return neighbours;
}
