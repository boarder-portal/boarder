import { MAZE_HEIGHT, MAZE_WIDTH } from 'common/constants/games/maze';

import { ICoords, IGamePlayer as ICommonPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import {
  EGameEvent,
  EMoveEvent,
  EPlayerSide,
  ESide,
  IGameInfoEvent,
  IPlayer,
  IPlayerMoveEvent,
  IWall,
  TMoveEvent,
} from 'common/types/maze';
import { EGame } from 'common/types/game';

import { getRandomIndex } from 'common/utilities/random';
import { getMazeCellNeighbors, getMazeWallCoords } from 'common/utilities/maze';
import { equalsCoords, notEqualsCoordsCb } from 'common/utilities/coords';
import Vector from 'common/utilities/Vector';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const MOVE_PLAYERS_INTERVAL = 40;
// cells per second
const BASE_PLAYER_SPEED = 3;

class MazeGame extends Game<EGame.MAZE> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EGameEvent.MOVE_PLAYER]: this.onMovePlayer,
    [EGameEvent.STOP_PLAYER]: this.onStopPlayer,
  };
  walls: IWall[] = [];
  movePlayersInterval?: NodeJS.Timer;

  constructor(options: IGameCreateOptions<EGame.MAZE>) {
    super(options);

    this.createGameInfo();
  }

  areFloatsEqual(float1: number, float2: number): boolean {
    return Math.abs(float1 - float2) < 1e5;
  }

  arePointsEqual(point1: ICoords, point2: ICoords): boolean {
    return this.areFloatsEqual(point1.x, point2.x) && this.areFloatsEqual(point1.y, point2.y);
  }

  createGameInfo(): void {
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const coords: ICoords = { x, y };

        this.walls.push(getMazeWallCoords(coords, ESide.TOP), getMazeWallCoords(coords, ESide.LEFT));

        if (x === MAZE_WIDTH - 1) {
          this.walls.push(getMazeWallCoords(coords, ESide.RIGHT));
        }

        if (y === MAZE_HEIGHT - 1) {
          this.walls.push(getMazeWallCoords(coords, ESide.BOTTOM));
        }
      }
    }

    this.removeWall({
      from: { x: 0, y: 0 },
      to: { x: 1, y: 0 },
    });
    this.removeWall({
      from: { x: MAZE_WIDTH - 1, y: MAZE_HEIGHT },
      to: { x: MAZE_WIDTH, y: MAZE_HEIGHT },
    });

    const startCell: ICoords = {
      x: getRandomIndex(MAZE_WIDTH),
      y: getRandomIndex(MAZE_HEIGHT),
    };
    const visitedCells: ICoords[] = [startCell];
    const path: ICoords[] = [startCell];

    while (visitedCells.length < MAZE_WIDTH * MAZE_HEIGHT) {
      let lastCellWithUnvisitedNeighborsIndex = path.length - 1;

      for (let i = path.length - 1; i >= 0; i--) {
        const coords = path[i];
        const neighbors = getMazeCellNeighbors(coords);

        if (Object.values(neighbors).some((coords) => visitedCells.every(notEqualsCoordsCb(coords)))) {
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

  createPlayer(roomPlayer: ICommonPlayer, index: number): IPlayer {
    const isTopPlayer = index === 0;

    return {
      ...roomPlayer,
      side: isTopPlayer ? EPlayerSide.TOP : EPlayerSide.BOTTOM,
      x: isTopPlayer ? 0.5 : MAZE_WIDTH - 0.5,
      y: isTopPlayer ? 0.5 : MAZE_HEIGHT - 0.5,
      directionAngle: isTopPlayer ? Math.PI / 2 : (Math.PI * 3) / 2,
      isMoving: false,
      moveEventsQueue: [],
      lastActionTimestamp: 0,
    };
  }

  movePlayers(): void {
    const now = Date.now();

    this.players.forEach((player) => {
      const moveEventsQueue: TMoveEvent[] = [];

      if (player.isMoving) {
        moveEventsQueue.push({
          type: EMoveEvent.MOVE,
          directionAngle: player.directionAngle,
          timestamp: player.lastActionTimestamp,
        });
      }

      moveEventsQueue.push(...player.moveEventsQueue);

      for (let i = 0; i < moveEventsQueue.length; i++) {
        const speed = BASE_PLAYER_SPEED;
        const moveEvent = moveEventsQueue[i];
        const nextTimestamp = i === moveEventsQueue.length - 1 ? now : moveEventsQueue[i + 1].timestamp;
        let isMoving = moveEvent.type === EMoveEvent.MOVE;

        if (moveEvent.type === EMoveEvent.MOVE) {
          const duration = nextTimestamp - moveEvent.timestamp;
          const distance = (speed * duration) / 1000;
          const collidingWalls: IWall[] = [];
          const wallsToPossiblyCollide: IWall[] = [];

          // find current colliding walls and walls that could possibly collide during tick
          this.walls.forEach((wall) => {
            // currently colliding walls are those that have a common point
            // walls that could possibly collide are those
          });

          const moveVector = new Vector({
            x: distance * Math.cos(player.directionAngle),
            y: distance * Math.sin(player.directionAngle),
          });

          // reduce moveVector due to colliding walls
          collidingWalls.forEach((wall) => {});

          if (moveVector.getLength() === 0) {
            isMoving = false;
          } else {
            // find distance to first colliding wall
            const distanceToFirstCollidingWall = Infinity;

            // find closest wall to collide if there's any
            wallsToPossiblyCollide.forEach((wall) => {});

            const eventualDistance = Math.min(distance, distanceToFirstCollidingWall);
            const eventualAngle = moveVector.getAngle();

            player.x += +(eventualDistance * Math.cos(eventualAngle)).toFixed(3);
            player.y += +(eventualDistance * Math.sin(eventualAngle)).toFixed(3);

            player.directionAngle = moveEvent.directionAngle;

            // went up to wall, continue same event
            if (eventualDistance !== distance) {
              moveEvent.timestamp += eventualDistance / speed;
              i--;

              continue;
            }
          }
        }

        player.isMoving = isMoving;
        player.lastActionTimestamp = nextTimestamp;
      }

      const moveEvent: IPlayerMoveEvent = {
        login: player.login,
        x: player.x,
        y: player.y,
      };

      if (player.isMoving || player.moveEventsQueue.length) {
        this.io.emit(EGameEvent.PLAYER_MOVED, moveEvent);
      }

      player.moveEventsQueue = [];
    });
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    const gameInfo: IGameInfoEvent = {
      walls: this.walls,
      players: this.players,
    };

    socket.emit(EGameEvent.GAME_INFO, gameInfo);
  }

  onMovePlayer({ socket, data: angle }: IGameEvent<number>): void {
    const player = this.getPlayerByLogin(socket.user?.login);

    player?.moveEventsQueue.push({
      type: EMoveEvent.MOVE,
      directionAngle: angle,
      timestamp: Date.now(),
    });
  }

  onStopPlayer({ socket }: IGameEvent): void {
    const player = this.getPlayerByLogin(socket.user?.login);

    player?.moveEventsQueue.push({
      type: EMoveEvent.STOP,
      timestamp: Date.now(),
    });
  }

  removeWall(wall: IWall): void {
    const wallIndex = this.walls.findIndex(
      ({ from, to }) => equalsCoords(wall.from, from) && equalsCoords(wall.to, to),
    );

    if (wallIndex !== -1) {
      this.walls.splice(wallIndex, 1);
    }
  }

  delete(): void {
    if (this.movePlayersInterval) {
      clearInterval(this.movePlayersInterval);
    }

    super.delete();
  }
}

export default MazeGame;
