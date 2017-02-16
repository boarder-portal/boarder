const _ = require('lodash');
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

exports.getAvailableCells = (field, player, lastSetCells) => {
  const { login } = player;
  const availableCells = [];

  _.forEach(field, (row) => {
    _.forEach(row, (cell) => {
      if (cell.player !== login) {
        return;
      }

      const neighbours = getNeighbours(cell, field);
      const availableNeighbours = _.filter(neighbours, ({ player, type }) => (
        !player || (
          player !== login
          && type === VIRUS
        )
      ));

      addAvailableCells(cell.type, availableCells, availableNeighbours, lastSetCells, neighbours, login);
    });
  });

  return availableCells;
};

function getNeighbours(cell, field) {
  const { x, y } = cell;
  const neighbours = [];
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

function addAvailableCells(type, availableCells, availableNeighbours, lastSetCells, neighbours, login) {
  if (type === VIRUS) {
    if (lastSetCells.length === 3) {
      availableNeighbours = _.filter(availableNeighbours, ({ player }) => player);
    }

    availableCells.push(...availableNeighbours);
  } else if (type === FORTRESS) {
    if (_.some(neighbours, ({ player, type }) => type === VIRUS && player === login)) {
      if (lastSetCells.length === 3) {
        availableNeighbours = _.filter(availableNeighbours, ({ player }) => player);
      }

      availableCells.push(...availableNeighbours);
    }
  }
}
