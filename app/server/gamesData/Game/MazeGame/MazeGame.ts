import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame, IPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import { EMazeGameEvent, ESide, IMazeGameInfo, IMazePlayer, IMazeWall } from 'common/types/maze';
import { ICoords } from 'common/types/game';

import { getRandomIndex } from 'common/utilities/random';
import { getMazeCellNeighbors, getMazeWallCoords } from 'common/utilities/maze';
import { equalsCoords, notEqualsCoordsCb } from 'common/utilities/coords';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.MAZE]: {
      mazeWidth,
      mazeHeight,
    },
  },
} = GAMES_CONFIG;

class MazeGame extends Game<EGame.MAZE> {
  handlers = {
    [EMazeGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  walls: IMazeWall[] = [];

  constructor(options: IGameCreateOptions<EGame.MAZE>) {
    super(options);

    this.createGameInfo();
  }

  createGameInfo() {
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        const coords: ICoords = { x, y };

        this.walls.push(
          getMazeWallCoords(coords, ESide.TOP),
          getMazeWallCoords(coords, ESide.LEFT),
        );

        if (x === mazeWidth - 1) {
          this.walls.push(getMazeWallCoords(coords, ESide.RIGHT));
        }

        if (y === mazeHeight - 1) {
          this.walls.push(getMazeWallCoords(coords, ESide.BOTTOM));
        }
      }
    }

    this.removeWall({
      from: { x: 0, y: 0 },
      to: { x: 1, y: 0 },
    });
    this.removeWall({
      from: { x: mazeWidth - 1, y: mazeHeight },
      to: { x: mazeWidth, y: mazeHeight },
    });

    const startCell: ICoords = {
      x: getRandomIndex(mazeWidth),
      y: getRandomIndex(mazeHeight),
    };
    const visitedCells: ICoords[] = [startCell];
    const path: ICoords[] = [startCell];

    while (visitedCells.length < mazeWidth * mazeHeight) {
      let lastCellWithUnvisitedNeighborsIndex = path.length - 1;

      for (let i = path.length - 1; i >= 0; i--) {
        const coords = path[i];
        const neighbors = getMazeCellNeighbors(coords);

        if (
          Object.values(neighbors).some((coords) => (
            visitedCells.every(notEqualsCoordsCb(coords))
          ))
        ) {
          lastCellWithUnvisitedNeighborsIndex = i;

          break;
        }
      }

      path.splice(lastCellWithUnvisitedNeighborsIndex + 1, path.length);

      const currentCoords = path[path.length - 1];
      const neighbors = getMazeCellNeighbors(currentCoords);
      const unvisitedNeighborCellsSides: ESide[] = [];

      Object.entries(neighbors).forEach(([side, coords]) => {
        if (visitedCells.every(notEqualsCoordsCb(coords))) {
          unvisitedNeighborCellsSides.push(side as ESide);
        }
      });

      const randomSide = unvisitedNeighborCellsSides[getRandomIndex(unvisitedNeighborCellsSides.length)];
      const neighborCoords = neighbors[randomSide];

      this.removeWall(getMazeWallCoords(currentCoords, randomSide));

      path.push(neighborCoords);
      visitedCells.push(neighborCoords);
    }
  }

  createPlayer(roomPlayer: IPlayer, index: number): IMazePlayer {
    return {
      ...roomPlayer,
      side: index === 0 ? 'top' : 'bottom',
    };
  }

  onGetGameInfo({ socket }: IGameEvent) {
    const gameInfo: IMazeGameInfo = {
      walls: this.walls,
    };

    socket.emit(EMazeGameEvent.GAME_INFO, gameInfo);
  }

  removeWall(wall: IMazeWall) {
    const wallIndex = this.walls.findIndex(({ from, to }) => (
      equalsCoords(wall.from, from)
      && equalsCoords(wall.to, to)
    ));

    if (wallIndex !== -1) {
      this.walls.splice(wallIndex, 1);
    }
  }
}

export default MazeGame;
