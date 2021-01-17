import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';
import { ESide } from 'common/types/maze';
import { ICoords } from 'common/types';

const {
  games: {
    [EGame.MAZE]: {
      mazeWidth,
      mazeHeight,
    },
  },
} = GAMES_CONFIG;

export function getMazeCellNeighbors<Side extends ESide>(cellCoords: ICoords): Record<Side, ICoords> {
  const neighbors = {} as Record<Side, ICoords>;

  if (cellCoords.x > 0) {
    neighbors[ESide.LEFT as Side] = { x: cellCoords.x - 1, y: cellCoords.y };
  }

  if (cellCoords.x < mazeWidth - 1) {
    neighbors[ESide.RIGHT as Side] = { x: cellCoords.x + 1, y: cellCoords.y };
  }

  if (cellCoords.y > 0) {
    neighbors[ESide.TOP as Side] = { x: cellCoords.x, y: cellCoords.y - 1 };
  }

  if (cellCoords.y < mazeHeight - 1) {
    neighbors[ESide.BOTTOM as Side] = { x: cellCoords.x, y: cellCoords.y + 1 };
  }

  return neighbors;
}

export function getMazeWallCoords(cellCoords: ICoords, side: ESide): { from: ICoords; to: ICoords } {
  if (side === ESide.LEFT) {
    return {
      from: { x: cellCoords.x, y: cellCoords.y },
      to: { x: cellCoords.x, y: cellCoords.y + 1 },
    };
  }

  if (side === ESide.RIGHT) {
    return {
      from: { x: cellCoords.x + 1, y: cellCoords.y },
      to: { x: cellCoords.x + 1, y: cellCoords.y + 1 },
    };
  }

  if (side === ESide.TOP) {
    return {
      from: { x: cellCoords.x, y: cellCoords.y },
      to: { x: cellCoords.x + 1, y: cellCoords.y },
    };
  }

  return {
    from: { x: cellCoords.x, y: cellCoords.y + 1 },
    to: { x: cellCoords.x + 1, y: cellCoords.y + 1 },
  };
}
