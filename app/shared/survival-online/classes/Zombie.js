const Creature = require('./Creature');

class Zombie extends Creature {
  constructor(args) {
    super(args);
  }

  move() {
    const rand = Math.random();
    const direction = rand < 0.25 ? 'left' : rand < 0.5 ? 'right' : rand < 0.75 ? 'top' : 'bottom';

    const toX = (direction == 'right' || direction == 'left') ? this.x + this.directionToProjection(direction) : this.x;
    const toY = (direction == 'top' || direction == 'bottom') ? this.y + this.directionToProjection(direction) : this.y;

    this.x = toX;
    this.y = toY;

    console.log({ x: this.x, y: this.y });
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
