import times from 'lodash/times';

import { EGame, IPlayer } from 'common/types';
import {
  ESurvivalOnlineBiome,
  ESurvivalOnlineDirection,
  ESurvivalOnlineGameEvent,
  ESurvivalOnlineObject,
  ISurvivalOnlineBaseObject,
  ISurvivalOnlineCell,
  ISurvivalOnlineCellWithObject,
  ISurvivalOnlinePlayer,
  ISurvivalOnlinePlayerObject,
  ISurvivalOnlineZombieObject,
  TSurvivalOnlineMap,
  TSurvivalOnlineObject,
} from 'common/types/survivalOnline';
import { IGameEvent } from 'server/types';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const MAP_WIDTH = 101;
const MAP_HEIGHT = 101;

const EDGE_CELLS: { x: number; y: number }[] = [];
const DIRECTIONS_DIFFS: Record<ESurvivalOnlineDirection, { x: number; y: number }> = {
  [ESurvivalOnlineDirection.UP]: { x: 0, y: -1 },
  [ESurvivalOnlineDirection.DOWN]: { x: 0, y: +1 },
  [ESurvivalOnlineDirection.LEFT]: { x: -1, y: 0 },
  [ESurvivalOnlineDirection.RIGHT]: { x: +1, y: 0 },
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
  static containsObject<Obj extends TSurvivalOnlineObject>(
    cell: ISurvivalOnlineCell,
    type: Obj['type'],
  ): cell is ISurvivalOnlineCellWithObject<Obj> {
    return (
      !!cell.object
      && cell.object.type === type
    );
  }

  handlers = {
    [ESurvivalOnlineGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [ESurvivalOnlineGameEvent.MOVE_PLAYER]: this.onMovePlayer,
  };

  map: TSurvivalOnlineMap = [];
  baseCell: ISurvivalOnlineCellWithObject<ISurvivalOnlineBaseObject> = {
    x: Math.floor(MAP_WIDTH / 2),
    y: Math.floor(MAP_HEIGHT / 2),
    biome: ESurvivalOnlineBiome.GRASS,
    object: {
      type: ESurvivalOnlineObject.BASE,
      hp: 100,
    },
  };
  zombies = new Set<{ cell: ISurvivalOnlineCellWithObject<ISurvivalOnlineZombieObject> }>();

  generateZombiesIterationInterval?: NodeJS.Timer;
  moveZombiesIterationInterval?: NodeJS.Timer;
  movePlayersIterationInterval?: NodeJS.Timer;

  constructor(options: IGameCreateOptions<EGame.SURVIVAL_ONLINE>) {
    super(options);

    this.createWorld();
  }

  createPlayer(roomPlayer: IPlayer): ISurvivalOnlinePlayer {
    return {
      ...roomPlayer,
      x: 0,
      y: 0,
      object: {
        type: ESurvivalOnlineObject.PLAYER,
        login: roomPlayer.login,
        hp: 100,
        direction: ESurvivalOnlineDirection.DOWN,
        isMoving: false,
      },
    };
  }

  createWorld() {
    times(MAP_HEIGHT, (y) => {
      this.map.push([]);

      times(MAP_WIDTH, (x) => {
        this.map[y].push({
          x,
          y,
          biome: ESurvivalOnlineBiome.GRASS,
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
            type: ESurvivalOnlineObject.TREE,
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

  generateZombies(count: number) {
    for (let i = 0; i < count; i++) {
      if (EDGE_CELLS.every(({ x, y }) => this.map[y][x].object)) {
        break;
      }

      while (true) {
        const { x, y } = EDGE_CELLS[Math.floor(Math.random() * EDGE_CELLS.length)];
        const cell = this.map[y][x];

        if (this.placeObject({
          type: ESurvivalOnlineObject.ZOMBIE,
          hp: 100,
          direction: ESurvivalOnlineDirection.DOWN,
        }, cell)) {
          this.zombies.add({ cell: cell as ISurvivalOnlineCellWithObject<ISurvivalOnlineZombieObject> });

          break;
        }
      }
    }
  }

  getCellInDirection(
    fromCell: ISurvivalOnlineCell,
    direction: ESurvivalOnlineDirection,
  ): ISurvivalOnlineCell | null {
    const { x: dx, y: dy } = DIRECTIONS_DIFFS[direction];

    return this.map[fromCell.y + dy]?.[fromCell.x + dx] || null;
  }

  moveObjectInDirection<Obj extends TSurvivalOnlineObject & { direction: ESurvivalOnlineDirection }>(
    cell: ISurvivalOnlineCellWithObject<Obj>,
    direction: ESurvivalOnlineDirection,
  ): [] | [ISurvivalOnlineCellWithObject<Obj>] | [ISurvivalOnlineCell, ISurvivalOnlineCellWithObject<Obj>] {
    const cellInDirection = this.getCellInDirection(cell, direction);

    if (cellInDirection && !cellInDirection.object) {
      cell.object.direction = direction;
      cellInDirection.object = cell.object;
      (cell as ISurvivalOnlineCell).object = null;

      if (SurvivalOnlineGame.containsObject<ISurvivalOnlinePlayerObject>(cellInDirection, ESurvivalOnlineObject.PLAYER)) {
        const player = this.players.find(
          ({ login }) => cellInDirection.object.login === login,
        );

        if (player) {
          player.x = cellInDirection.x;
          player.y = cellInDirection.y;
        }
      }

      return [cell, cellInDirection as ISurvivalOnlineCellWithObject<Obj>];
    }

    if (cell.object.direction !== direction) {
      cell.object.direction = direction;

      return [cell];
    }

    return [];
  }

  moveZombies() {
    const cellsToUpdate: ISurvivalOnlineCell[] = [];

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

      const possibleDirections: ESurvivalOnlineDirection[] = [];

      if (zombie.cell.x !== closestPlayer.x) {
        possibleDirections.push(
          zombie.cell.x < closestPlayer.x
            ? ESurvivalOnlineDirection.RIGHT
            : ESurvivalOnlineDirection.LEFT,
        );
      }

      if (zombie.cell.y !== closestPlayer.y) {
        possibleDirections.push(
          zombie.cell.y < closestPlayer.y
            ? ESurvivalOnlineDirection.DOWN
            : ESurvivalOnlineDirection.UP,
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

  onGetGameInfo({ socket }: IGameEvent) {
    socket.emit(ESurvivalOnlineGameEvent.GAME_INFO, {
      map: this.map,
      players: this.players,
    });
  }

  onMovePlayer({ socket, data: direction }: IGameEvent<ESurvivalOnlineDirection>) {
    const player = this.players.find(({ login }) => login === socket.user?.login);

    if (!player) {
      return;
    }

    const playerCell = this.map[player.y][player.x];

    if (
      !SurvivalOnlineGame.containsObject<ISurvivalOnlinePlayerObject>(playerCell, ESurvivalOnlineObject.PLAYER)
      || playerCell.object.login !== player.login
    ) {
      return;
    }

    this.sendGameUpdate(this.moveObjectInDirection(playerCell, direction), true);
  }

  placeObject(object: TSurvivalOnlineObject, cell: ISurvivalOnlineCell): boolean {
    if (this.map[cell.y][cell.x].object) {
      return false;
    }

    this.map[cell.y][cell.x].object = object;

    return true;
  }

  placeObjectRandomly(object: TSurvivalOnlineObject): boolean {
    const randomIndex = Math.floor(Math.random() * MAP_WIDTH * MAP_HEIGHT);
    const y = Math.floor(randomIndex / MAP_WIDTH);
    const x = randomIndex % MAP_WIDTH;

    return this.placeObject(object, this.map[y][x]);
  }

  sendGameUpdate(cells: ISurvivalOnlineCell[], withPlayers: boolean) {
    if (cells.length) {
      this.io.emit(ESurvivalOnlineGameEvent.UPDATE_GAME, {
        cells,
        players: withPlayers ? this.players : null,
      });
    }
  }

  deleteGame() {
    if (this.moveZombiesIterationInterval) {
      clearInterval(this.moveZombiesIterationInterval);
    }

    if (this.movePlayersIterationInterval) {
      clearInterval(this.movePlayersIterationInterval);
    }

    if (this.generateZombiesIterationInterval) {
      clearInterval(this.generateZombiesIterationInterval);
    }

    super.deleteGame();
  }
}

export default SurvivalOnlineGame;
