import { Coords } from 'common/types';

export function equalsCoords(coords1: Coords, coords2: Coords): boolean {
  return coords1.x === coords2.x && coords1.y === coords2.y;
}

export function equalsCoordsCb(coords: Coords): (coords: Coords) => boolean {
  return (coords2) => equalsCoords(coords, coords2);
}

export function notEqualsCoords(coords1: Coords, coords2: Coords): boolean {
  return coords1.x !== coords2.x || coords1.y !== coords2.y;
}

export function notEqualsCoordsCb(coords: Coords): (coords: Coords) => boolean {
  return (coords2) => notEqualsCoords(coords, coords2);
}
