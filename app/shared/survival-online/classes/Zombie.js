const _ = require('lodash');
const Creature = require('./Creature');

class Zombie extends Creature {
  constructor(args) {
    super(args);
  }

  move() {
    const {
      map,
      x: fromX,
      y: fromY
    } = this;

    const changedCells = [];
    const rand = Math.random();
    const direction = rand < 0.25 ? 'left' : rand < 0.5 ? 'right' : rand < 0.75 ? 'top' : 'bottom';

    const toX = (direction === 'right' || direction === 'left') ? this.x + this.directionToProjection(direction) : this.x;
    const toY = (direction === 'top' || direction === 'bottom') ? this.y + this.directionToProjection(direction) : this.y;

    const cellFrom = map[fromY] && map[fromY][fromX];
    const cellTo = map[toY] && map[toY][toX];

    cellFrom.creature.direction = direction;
    changedCells.push(cellFrom);

    if (cellTo && !cellTo.building && !cellTo.creature) {
      this.x = toX;
      this.y = toY;

      cellTo.creature = cellFrom.creature;
      cellFrom.creature = null;

      changedCells.push({ ...cellTo, move: { direction } });

      this.changeChunkIfNeeded();
    }

    this.lastMovedTimestamp = Date.now();

    return { changedCells };
  }

  toJSON() {
    const {
      x,
      y,
      type,
      direction
    } = this;

    return {
      x,
      y,
      type,
      direction
    }
  }
}

module.exports = Zombie;
