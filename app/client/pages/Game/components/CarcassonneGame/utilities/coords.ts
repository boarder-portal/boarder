import { ICoords } from 'common/types';

export function getRotatedCoords(coords: ICoords, rotation: number): ICoords {
  const { x, y } = coords;

  if (rotation === 0 || rotation === 2) {
    return {
      x: rotation === 0 ? x : 1 - x,
      y: rotation === 0 ? y : 1 - y,
    };
  }

  return {
    x: rotation === 1 ? 1 - y : y,
    y: rotation === 1 ? x : 1 - x,
  };
}
