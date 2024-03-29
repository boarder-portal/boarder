import times from 'lodash/times';

import { SECOND } from 'common/constants/date';

import { GameType } from 'common/types/game';
import {
  BiomeType,
  Cell,
  Direction,
  Game,
  GameResult,
  GameServerEventType,
  Player as PlayerModel,
} from 'common/types/games/survivalOnline';

import { getRandomElement } from 'common/utilities/random';
import Entity, { EntityConstructor, EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';

import Base from 'server/gamesData/Game/SurvivalOnlineGame/entities/Base';
import Player from 'server/gamesData/Game/SurvivalOnlineGame/entities/Player';
import Tree from 'server/gamesData/Game/SurvivalOnlineGame/entities/Tree';
import Zombie from 'server/gamesData/Game/SurvivalOnlineGame/entities/Zombie';

export type GameObject = Base | Player | Tree | Zombie;

export type MapObject = Base | Player | Tree | Zombie;

export type MovingObject = Player | Zombie;

export interface ServerCell<Obj extends MapObject = MapObject> {
  x: number;
  y: number;
  biome: BiomeType;
  entity: Obj | null;
}

export interface ServerCellWithEntity<Entity extends MapObject> extends ServerCell<Entity> {
  entity: Entity;
}

const MAP_WIDTH = 101;
const MAP_HEIGHT = 101;

const EDGE_CELLS: { x: number; y: number }[] = [];
const DIRECTIONS_DIFFS: Record<Direction, { x: number; y: number }> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: +1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: +1, y: 0 },
};

for (let x = 0; x < MAP_WIDTH; x++) {
  EDGE_CELLS.push({ x, y: 0 }, { x, y: MAP_HEIGHT - 1 });
}

for (let y = 1; y < MAP_HEIGHT - 1; y++) {
  EDGE_CELLS.push({ x: 0, y }, { x: MAP_WIDTH - 1, y });
}

const START_TREE_COUNT = Math.round(MAP_WIDTH * MAP_HEIGHT * 0.05);
const START_ZOMBIE_COUNT = Math.round(EDGE_CELLS.length * 0.1);
const NEW_ZOMBIES_COUNT = Math.round(START_ZOMBIE_COUNT * 0.25);

const ZOMBIES_MOVE_INTERVAL = 500;
const ZOMBIES_GENERATE_INTERVAL = 30 * SECOND;

export default class SurvivalOnlineGame extends Entity<GameResult> {
  time = this.addComponent(Time<this>, {
    isPauseAvailable: () => true,
  });
  gameInfo = this.obtainComponent(GameInfo<GameType.SURVIVAL_ONLINE, this>);
  server = this.obtainComponent(Server<GameType.SURVIVAL_ONLINE, this>);

  players: Player[] = [];
  map: ServerCell[][] = [];
  base: Base | null = null;
  zombies = new Set<Zombie>();

  *lifecycle(): EntityGenerator<GameResult> {
    this.generateWorld();

    yield* this.all([
      this.time.repeatTask(ZOMBIES_MOVE_INTERVAL, this.moveZombies),
      this.time.repeatTask(ZOMBIES_GENERATE_INTERVAL, function* () {
        this.spawnZombies(NEW_ZOMBIES_COUNT);
      }),
    ]);
  }

  generateWorld(): void {
    times(MAP_HEIGHT, (y) => {
      this.map.push([]);

      times(MAP_WIDTH, (x) => {
        this.map[y].push({
          x,
          y,
          biome: BiomeType.GRASS,
          entity: null,
        });
      });
    });

    const baseCell = this.map[Math.floor(MAP_HEIGHT / 2)][Math.floor(MAP_WIDTH / 2)];

    this.base = this.spawnMapEntity(Base, baseCell, { cell: baseCell });

    const cellsAroundBase = [
      this.map[baseCell.y][baseCell.x - 1],
      this.map[baseCell.y - 1][baseCell.x],
      this.map[baseCell.y][baseCell.x + 1],
      this.map[baseCell.y + 1][baseCell.x],
    ];

    this.players = this.gameInfo.getPlayersData((playerIndex) => {
      const cell = cellsAroundBase[playerIndex];

      return this.spawnMapEntity(Player, cell, {
        cell,
        index: playerIndex,
      });
    });

    for (let i = 0; i < START_TREE_COUNT; i++) {
      const cell = this.getRandomFreeCell();

      this.spawnMapEntity(Tree, cell, { cell });
    }

    this.spawnZombies(START_ZOMBIE_COUNT);
  }

  getCellInDirection(fromCell: ServerCell, direction: Direction): ServerCell | null {
    const { x: dx, y: dy } = DIRECTIONS_DIFFS[direction];

    return this.map[fromCell.y + dy]?.[fromCell.x + dx] ?? null;
  }

  getGamePlayers(): PlayerModel[] {
    return this.gameInfo.getPlayersWithData((playerIndex) => this.players[playerIndex].toPlayerData());
  }

  getRandomFreeCell(): ServerCell {
    let cell: ServerCell;

    do {
      const randomIndex = Math.floor(Math.random() * MAP_WIDTH * MAP_HEIGHT);
      const y = Math.floor(randomIndex / MAP_WIDTH);
      const x = randomIndex % MAP_WIDTH;

      cell = this.map[y][x];
    } while (cell.entity);

    return cell;
  }

  moveEntityInDirection<Entity extends MovingObject>(
    entity: Entity,
    direction: Direction,
  ): [] | [ServerCellWithEntity<Entity>] | [ServerCell, ServerCellWithEntity<Entity>] {
    const { cell } = entity;
    const cellInDirection = this.getCellInDirection(cell, direction);

    if (cellInDirection && !cellInDirection.entity) {
      entity.direction = direction;

      this.placeEntity(entity, cellInDirection);
      this.removeEntity(cell);

      if (entity instanceof Player) {
        this.players[entity.index].cell = cellInDirection as ServerCellWithEntity<Player>;
      }

      return [cell, cellInDirection as ServerCellWithEntity<Entity>];
    }

    if (entity.direction !== direction) {
      entity.direction = direction;

      return [entity.cell as ServerCellWithEntity<Entity>];
    }

    return [];
  }

  *moveZombies(): EntityGenerator {
    const cellsToUpdate: ServerCell[] = [];

    for (const zombie of this.zombies) {
      cellsToUpdate.push(...zombie.move());
    }

    this.sendGameUpdate([...new Set(cellsToUpdate)], false);
  }

  placeEntity<Entity extends MapObject>(entity: Entity, cell: ServerCell): void {
    cell.entity = entity;
  }

  removeEntity(cell: ServerCellWithEntity<GameObject>): void {
    (cell as ServerCell).entity = null;
  }

  sendGameUpdate(cells: ServerCell[], withPlayers: boolean): void {
    if (cells.length) {
      this.server.sendSocketEvent(GameServerEventType.UPDATE_GAME, {
        cells: cells.map(this.transformCell),
        players: withPlayers ? this.getGamePlayers() : null,
      });
    }
  }

  spawnMapEntity<Constructor extends EntityConstructor<MapObject>>(
    constructor: Constructor,
    cell: ServerCell,
    ...args: ConstructorParameters<Constructor>
  ): InstanceType<Constructor> {
    const entity = this.spawnEntity(constructor, ...args);

    this.placeEntity(entity, cell);

    return entity;
  }

  *spawnZombie(cell: ServerCellWithEntity<Zombie>): EntityGenerator {
    const zombie = this.spawnMapEntity(Zombie, cell, { cell });

    this.zombies.add(zombie);

    yield* this.waitForEntity(zombie);

    this.zombies.delete(zombie);
  }

  spawnZombies(count: number): void {
    for (let i = 0; i < count; i++) {
      if (EDGE_CELLS.every(({ x, y }) => this.map[y][x].entity)) {
        break;
      }

      let zombieCell: ServerCell;

      do {
        const { x, y } = getRandomElement(EDGE_CELLS);

        zombieCell = this.map[y][x];
      } while (zombieCell.entity);

      this.spawnTask(this.spawnZombie(zombieCell as ServerCellWithEntity<Zombie>));
    }
  }

  transformCell = (cell: ServerCell): Cell => {
    return {
      x: cell.x,
      y: cell.y,
      biome: cell.biome,
      object: cell.entity?.toJSON() ?? null,
    };
  };

  toJSON(): Game {
    return {
      map: this.map.map((row) => row.map(this.transformCell)),
      players: this.getGamePlayers(),
    };
  }
}
