import { Coords } from 'common/types';
import { Direction } from 'common/types/bombers';

export default function getCoordsBehind(coords: Coords, direction: Direction): Coords {
  if (direction === Direction.UP) {
    return {
      x: coords.x,
      y: coords.y - 1,
    };
  }

  if (direction === Direction.DOWN) {
    return {
      x: coords.x,
      y: coords.y + 1,
    };
  }

  if (direction === Direction.LEFT) {
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
