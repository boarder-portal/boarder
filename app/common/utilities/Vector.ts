import { ICoords } from 'common/types/game';

class Vector {
  from: ICoords;
  to: ICoords;

  // if called with 1 point, it will be "to" and "from" will be (0, 0)
  // if called with 2 points, it will be "to" and "from" will be (0, 0)
  constructor(point1: ICoords, point2?: ICoords) {
    if (point2) {
      this.from = { ...point1 };
      this.to = { ...point2 };
    } else {
      this.from = { x: 0, y: 0 };
      this.to = point1;
    }
  }

  add(vector: Vector) {
    this.to.x += vector.to.x - vector.from.x;
    this.to.y += vector.to.y - vector.from.y;
  }

  // returns angle in [0, 2pi)
  getAngle(): number {
    const xProjection = this.to.x - this.from.x;
    const yProjection = this.to.y - this.from.y;
    const atan = Math.atan(yProjection / xProjection);

    return xProjection >= 0
      ? yProjection >= 0
        ? atan
        : atan + 2 * Math.PI
      : atan + Math.PI;
  }

  getLength(): number {
    return Math.hypot(this.from.x - this.to.x, this.from.y - this.to.y);
  }

  getXProjection(): number {
    return this.to.x - this.from.x;
  }

  getYProjection(): number {
    return this.to.y - this.from.y;
  }

  multiply(coefficient: number) {
    this.to.x += coefficient * (this.to.x - this.from.x);
    this.to.y += coefficient * (this.to.y - this.from.y);
  }

  subtract(vector: Vector) {
    this.to.x -= vector.to.x - vector.from.x;
    this.to.y -= vector.to.y - vector.from.y;
  }
}

export default Vector;
