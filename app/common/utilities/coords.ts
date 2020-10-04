import { ICoords } from 'common/types/game';

export function equalsCoords(coords1: ICoords, coords2: ICoords): boolean {
  return coords1.x === coords2.x && coords1.y === coords2.y;
}

export function equalsCoordsCb(coords: ICoords): (coords: ICoords) => boolean {
  return (coords2) => equalsCoords(coords, coords2);
}

export function notEqualsCoords(coords1: ICoords, coords2: ICoords): boolean {
  return coords1.x !== coords2.x || coords1.y !== coords2.y;
}

export function notEqualsCoordsCb(coords: ICoords): (coords: ICoords) => boolean {
  return (coords2) => notEqualsCoords(coords, coords2);
}
