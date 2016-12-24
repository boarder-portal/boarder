let D = require('dwayne');

D = D.D || D;

exports.getNeighbourCells = (field, color, playerCells) => {
  const neighbourCells = D([]);
  let array = playerCells;
  let condition = true;

  while (condition) {
    const newCells = D([]);

    array.forEach((cell) => {
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

      newNewCells = newNewCells.filter((cell) => !neighbourCells.includes(cell));

      newCells.push(...newNewCells);
      neighbourCells.push(...newNewCells);
    });

    array = newCells;
    condition = newCells.length > 0;
  }

  return neighbourCells;
};
