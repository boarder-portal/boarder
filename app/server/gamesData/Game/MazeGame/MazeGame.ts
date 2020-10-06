import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame, IPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import {
  EMazeGameEvent,
  EMazeMoveEvent,
  EMazePlayerSide,
  ESide,
  IMazeGameInfo,
  IMazePlayer,
  IMazePlayerMoveEvent,
  IMazeWall,
  TMazeMoveEvent,
} from 'common/types/maze';
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

const MOVE_PLAYERS_INTERVAL = 40;
// 1 cells per second
const BASE_PLAYER_SPEED = 2;

class MazeGame extends Game<EGame.MAZE> {
  handlers = {
    [EMazeGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EMazeGameEvent.MOVE_PLAYER]: this.onMovePlayer,
    [EMazeGameEvent.STOP_PLAYER]: this.onStopPlayer,
  };
  walls: IMazeWall[] = [];
  movePlayersInterval?: NodeJS.Timer;

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

    this.movePlayersInterval = setInterval(() => this.movePlayers(), MOVE_PLAYERS_INTERVAL) as any;
  }

  createPlayer(roomPlayer: IPlayer, index: number): IMazePlayer {
    const isTopPlayer = index === 0;

    return {
      ...roomPlayer,
      side: isTopPlayer ? EMazePlayerSide.TOP : EMazePlayerSide.BOTTOM,
      x: isTopPlayer ? 0.5 : mazeWidth - 0.5,
      y: isTopPlayer ? 0.5 : mazeHeight - 0.5,
      directionAngle: isTopPlayer ? Math.PI / 2 : Math.PI * 3 / 2,
      isMoving: false,
      moveEventsQueue: [],
      lastActionTimestamp: 0,
    };
  }

  movePlayers() {
    const now = Date.now();

    this.players.forEach((player) => {
      const moveEventsQueue: TMazeMoveEvent[] = [];

      if (player.isMoving) {
        moveEventsQueue.push({
          type: EMazeMoveEvent.MOVE,
          directionAngle: player.directionAngle,
          timestamp: player.lastActionTimestamp,
        });
      }

      moveEventsQueue.push(
        ...player.moveEventsQueue,
        {
          type: EMazeMoveEvent.STOP,
          timestamp: now,
        },
      );

      moveEventsQueue.forEach((moveEvent, index) => {
        if (index !== 0 && player.isMoving) {
          const duration = moveEvent.timestamp - moveEventsQueue[index - 1].timestamp;
          const distance = BASE_PLAYER_SPEED * duration / 1000;

          player.x += +(distance * Math.cos(player.directionAngle)).toFixed(3);
          player.y += +(distance * Math.sin(player.directionAngle)).toFixed(3);
        }

        if (index !== moveEventsQueue.length - 1) {
          player.isMoving = moveEvent.type === EMazeMoveEvent.MOVE;
        }

        if (moveEvent.type === EMazeMoveEvent.MOVE) {
          player.directionAngle = moveEvent.directionAngle;
        }

        player.lastActionTimestamp = moveEvent.timestamp;
      });

      const lastMoveEndTimestamp = player.moveEventsQueue.length
        ? player.moveEventsQueue[0].timestamp
        : now;

      if (player.isMoving) {
        const distance = BASE_PLAYER_SPEED * (lastMoveEndTimestamp - player.lastActionTimestamp) / 1000;

        player.x += distance * Math.cos(player.directionAngle);
        player.y += distance * Math.sin(player.directionAngle);
      }

      const moveEvent: IMazePlayerMoveEvent = {
        login: player.login,
        x: player.x,
        y: player.y,
      };

      if (player.isMoving || player.moveEventsQueue.length) {
        this.io.emit(EMazeGameEvent.PLAYER_MOVED, moveEvent);
      }

      player.moveEventsQueue = [];
    });
  }

  onGetGameInfo({ socket }: IGameEvent) {
    const gameInfo: IMazeGameInfo = {
      walls: this.walls,
      players: this.players,
    };

    socket.emit(EMazeGameEvent.GAME_INFO, gameInfo);
  }

  onMovePlayer({ socket, data: angle }: IGameEvent<number>) {
    const player = this.players.find(({ login }) => login === socket.user?.login);

    player?.moveEventsQueue.push({
      type: EMazeMoveEvent.MOVE,
      directionAngle: angle,
      timestamp: Date.now(),
    });
  }

  onStopPlayer({ socket }: IGameEvent) {
    const player = this.players.find(({ login }) => login === socket.user?.login);

    player?.moveEventsQueue.push({
      type: EMazeMoveEvent.STOP,
      timestamp: Date.now(),
    });
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

  deleteGame() {
    if (this.movePlayersInterval) {
      clearInterval(this.movePlayersInterval);
    }

    super.deleteGame();
  }
}

export default MazeGame;
