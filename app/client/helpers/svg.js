import _ from 'lodash';

export function createSVGPolygonPath(pointsArray) {
  return _(pointsArray)
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');
}
