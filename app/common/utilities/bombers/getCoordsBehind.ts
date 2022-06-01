import { ICoords } from 'common/types';
import { EDirection } from 'common/types/bombers';

export default function getCoordsBehind(coords: ICoords, direction: EDirection): ICoords {
  if (direction === EDirection.UP) {
    return {
      x: coords.x,
      y: coords.y - 1,
    };
  }

  if (direction === EDirection.DOWN) {
    return {
      x: coords.x,
      y: coords.y + 1,
    };
  }

  if (direction === EDirection.LEFT) {
    return {
      x: coords.x - 1,
      y: coords.y,
    };
  }

  return {
    x: coords.x + 1,
    y: coords.y,
  };
}
