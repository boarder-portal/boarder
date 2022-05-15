import times from 'lodash/times';

import { IGamePlayer as ICommonPlayer } from 'common/types';
import {
  EBiome,
  EDirection,
  EGameEvent,
  EObject,
  IBaseObject,
  ICell,
  ICellWithObject,
  IPlayer,
  IPlayerObject,
  IZombieObject,
  TMap,
  TObject,
} from 'common/types/survivalOnline';
import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const MAP_WIDTH = 101;
const MAP_HEIGHT = 101;

const EDGE_CELLS: { x: number; y: number }[] = [];
const DIRECTIONS_DIFFS: Record<EDirection, { x: number; y: number }> = {
  [EDirection.UP]: { x: 0, y: -1 },
  [EDirection.DOWN]: { x: 0, y: +1 },
  [EDirection.LEFT]: { x: -1, y: 0 },
  [EDirection.RIGHT]: { x: +1, y: 0 },
};

for (let x = 0; x < MAP_WIDTH; x++) {
  EDGE_CELLS.push(
    { x, y: 0 },
    { x, y: MAP_HEIGHT - 1 },
  );
}

for (let y = 1; y < MAP_HEIGHT - 1; y++) {
  EDGE_CELLS.push(
    { x: 0, y },
    { x: MAP_WIDTH - 1, y },
  );
}

const START_TREE_COUNT = Math.round(MAP_WIDTH * MAP_HEIGHT * 0.05);
const START_ZOMBIE_COUNT = Math.round(EDGE_CELLS.length * 0.1);
const NEW_ZOMBIES_COUNT = Math.round(START_ZOMBIE_COUNT * 0.25);

const ZOMBIES_MOVE_INTERVAL = 500;
const ZOMBIES_GENERATE_INTERVAL = 30 * 1000;

class SurvivalOnlineGame extends Game<EGame.SURVIVAL_ONLINE> {
  static containsObject<Obj extends TObject>(
    cell: ICell,
    type: Obj['type'],
  ): cell is ICellWithObject<Obj> {
    return (
      !!cell.object
      && cell.object.type === type
    );
  }

  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EGameEvent.MOVE_PLAYER]: this.onMovePlayer,
  };

  map: TMap = [];
  baseCell: ICellWithObject<IBaseObject> = {
    x: Math.floor(MAP_WIDTH / 2),
    y: Math.floor(MAP_HEIGHT / 2),
    biome: EBiome.GRASS,
    object: {
      type: EObject.BASE,
      hp: 100,
    },
  };
  zombies = new Set<{ cell: ICellWithObject<IZombieObject> }>();

  generateZombiesIterationInterval?: NodeJS.Timer;
  moveZombiesIterationInterval?: NodeJS.Timer;
  movePlayersIterationInterval?: NodeJS.Timer;

  constructor(options: IGameCreateOptions<EGame.SURVIVAL_ONLINE>) {
    super(options);

    this.createWorld();
  }

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      x: 0,
      y: 0,
      object: {
        type: EObject.PLAYER,
        login: roomPlayer.login,
        hp: 100,
        direction: EDirection.DOWN,
        isMoving: false,
      },
    };
  }

  createWorld(): void {
    times(MAP_HEIGHT, (y) => {
      this.map.push([]);

      times(MAP_WIDTH, (x) => {
        this.map[y].push({
          x,
          y,
          biome: EBiome.GRASS,
          object: null,
        });
      });
    });

    this.map[this.baseCell.y][this.baseCell.x] = this.baseCell;

    const cellsAroundBase = [
      this.map[this.baseCell.y][this.baseCell.x - 1],
      this.map[this.baseCell.y - 1][this.baseCell.x],
      this.map[this.baseCell.y][this.baseCell.x + 1],
      this.map[this.baseCell.y + 1][this.baseCell.x],
    ];

    this.players.forEach((player, index) => {
      const cell = cellsAroundBase[index];

      cell.object = player.object;

      player.x = cell.x;
      player.y = cell.y;
    });

    for (let i = 0; i < START_TREE_COUNT; i++) {
      while (true) {
        if (
          this.placeObjectRandomly({
            type: EObject.TREE,
            hp: 100,
          })
        ) {
          break;
        }
      }
    }

    this.generateZombies(START_ZOMBIE_COUNT);

    this.moveZombiesIterationInterval = setInterval(
      () => this.moveZombies(),
      ZOMBIES_MOVE_INTERVAL,
    ) as any;
    this.generateZombiesIterationInterval = setInterval(
      () => this.generateZombies(NEW_ZOMBIES_COUNT),
      ZOMBIES_GENERATE_INTERVAL,
    ) as any;
  }

  generateZombies(count: number): void {
    for (let i = 0; i < count; i++) {
      if (EDGE_CELLS.every(({ x, y }) => this.map[y][x].object)) {
        break;
      }

      while (true) {
        const { x, y } = EDGE_CELLS[Math.floor(Math.random() * EDGE_CELLS.length)];
        const cell = this.map[y][x];

        if (this.placeObject({
          type: EObject.ZOMBIE,
          hp: 100,
          direction: EDirection.DOWN,
        }, cell)) {
          this.zombies.add({ cell: cell as ICellWithObject<IZombieObject> });

          break;
        }
      }
    }
  }

  getCellInDirection(
    fromCell: ICell,
    direction: EDirection,
  ): ICell | null {
    const { x: dx, y: dy } = DIRECTIONS_DIFFS[direction];

    return this.map[fromCell.y + dy]?.[fromCell.x + dx] || null;
  }

  moveObjectInDirection<Obj extends TObject & { direction: EDirection }>(
    cell: ICellWithObject<Obj>,
    direction: EDirection,
  ): [] | [ICellWithObject<Obj>] | [ICell, ICellWithObject<Obj>] {
    const cellInDirection = this.getCellInDirection(cell, direction);

    if (cellInDirection && !cellInDirection.object) {
      cell.object.direction = direction;
      cellInDirection.object = cell.object;
      (cell as ICell).object = null;

      if (SurvivalOnlineGame.containsObject<IPlayerObject>(cellInDirection, EObject.PLAYER)) {
        const player = this.getPlayerByLogin(cellInDirection.object.login);

        if (player) {
          player.x = cellInDirection.x;
          player.y = cellInDirection.y;
        }
      }

      return [cell, cellInDirection as ICellWithObject<Obj>];
    }

    if (cell.object.direction !== direction) {
      cell.object.direction = direction;

      return [cell];
    }

    return [];
  }

  moveZombies(): void {
    const cellsToUpdate: ICell[] = [];

    for (const zombie of this.zombies) {
      let closestPlayer = this.players[0];
      let closestPlayerDistance = Infinity;

      this.players.forEach((player) => {
        const distance = Math.abs(zombie.cell.x - player.x) + Math.abs(zombie.cell.y - player.y);

        if (distance < closestPlayerDistance) {
          closestPlayer = player;
          closestPlayerDistance = distance;
        }
      });

      const possibleDirections: EDirection[] = [];

      if (zombie.cell.x !== closestPlayer.x) {
        possibleDirections.push(
          zombie.cell.x < closestPlayer.x
            ? EDirection.RIGHT
            : EDirection.LEFT,
        );
      }

      if (zombie.cell.y !== closestPlayer.y) {
        possibleDirections.push(
          zombie.cell.y < closestPlayer.y
            ? EDirection.DOWN
            : EDirection.UP,
        );
      }

      const changedCells = this.moveObjectInDirection(
        zombie.cell,
        possibleDirections[Math.floor(Math.random() * possibleDirections.length)],
      );

      zombie.cell = changedCells[1] || zombie.cell;

      cellsToUpdate.push(...changedCells);
    }

    this.sendGameUpdate(cellsToUpdate, false);
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    socket.emit(EGameEvent.GAME_INFO, {
      map: this.map,
      players: this.players,
    });
  }

  onMovePlayer({ socket, data: direction }: IGameEvent<EDirection>): void {
    const player = this.getPlayerByLogin(socket.user?.login);

    if (!player) {
      return;
    }

    const playerCell = this.map[player.y][player.x];

    if (
      !SurvivalOnlineGame.containsObject<IPlayerObject>(playerCell, EObject.PLAYER)
      || playerCell.object.login !== player.login
    ) {
      return;
    }

    this.sendGameUpdate(this.moveObjectInDirection(playerCell, direction), true);
  }

  placeObject(object: TObject, cell: ICell): boolean {
    if (this.map[cell.y][cell.x].object) {
      return false;
    }

    this.map[cell.y][cell.x].object = object;

    return true;
  }

  placeObjectRandomly(object: TObject): boolean {
    const randomIndex = Math.floor(Math.random() * MAP_WIDTH * MAP_HEIGHT);
    const y = Math.floor(randomIndex / MAP_WIDTH);
    const x = randomIndex % MAP_WIDTH;

    return this.placeObject(object, this.map[y][x]);
  }

  sendGameUpdate(cells: ICell[], withPlayers: boolean): void {
    if (cells.length) {
      this.io.emit(EGameEvent.UPDATE_GAME, {
        cells,
        players: withPlayers ? this.players : null,
      });
    }
  }

  delete(): void {
    if (this.moveZombiesIterationInterval) {
      clearInterval(this.moveZombiesIterationInterval);
    }

    if (this.movePlayersIterationInterval) {
      clearInterval(this.movePlayersIterationInterval);
    }

    if (this.generateZombiesIterationInterval) {
      clearInterval(this.generateZombiesIterationInterval);
    }

    super.delete();
  }
}

export default SurvivalOnlineGame;
