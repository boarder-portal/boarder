import _ from 'lodash';

export function getNeighbourCells(field, color, playerCells) {
  const neighbourCells = [];
  let array = playerCells;
  let condition = true;

  while (condition) {
    const newCells = [];

    _.forEach(array, (cell) => {
      const { x, y } = cell;
      const top = field[y - 1] && field[y - 1][x];
      const bottom = field[y + 1] && field[y + 1][x];
      const left = field[y][x - 1];
      const right = field[y][x + 1];
      let newNewCells = [];

      if (top && top.color === color) {
        newNewCells.push(top);
      }

      if (bottom && bottom.color === color) {
        newNewCells.push(bottom);
      }

      if (left && left.color === color) {
        newNewCells.push(left);
      }

      if (right && right.color === color) {
        newNewCells.push(right);
      }

      newNewCells = _.filter(newNewCells, (cell) => !_.includes(neighbourCells, cell));

      newCells.push(...newNewCells);
      neighbourCells.push(...newNewCells);
    });

    array = newCells;
    condition = newCells.length > 0;
  }

  return neighbourCells;
}
