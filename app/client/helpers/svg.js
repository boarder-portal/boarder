import { D } from 'dwayne';

export function createSVGPolygonPath(pointsArray) {
  return D(pointsArray)
    .map(({ x, y }) => `${ x },${ y }`)
    .join(' ');
}
