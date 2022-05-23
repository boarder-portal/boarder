import times from 'lodash/times';

import { EGame } from 'common/types/game';
import {
  EBiome,
  EDirection,
  EGameServerEvent,
  ICell,
  IGame,
  IPlayer,
} from 'common/types/survivalOnline';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { getRandomElement } from 'common/utilities/random';

import Base from 'server/gamesData/Game/SurvivalOnlineGame/entities/Base';
import Player from 'server/gamesData/Game/SurvivalOnlineGame/entities/Player';
import Tree from 'server/gamesData/Game/SurvivalOnlineGame/entities/Tree';
import Zombie from 'server/gamesData/Game/SurvivalOnlineGame/entities/Zombie';

export type TEntity = Base | Player | Tree | Zombie;

export type TMovingEntity = Player | Zombie;

export interface IServerCell<Entity extends TEntity = TEntity> {
  x: number;
  y: number;
  biome: EBiome;
  entity: Entity | null;
}

export interface IServerCellWithEntity<Entity extends TEntity> extends IServerCell<Entity> {
  entity: Entity;
}

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
  EDGE_CELLS.push({ x, y: 0 }, { x, y: MAP_HEIGHT - 1 });
}

for (let y = 1; y < MAP_HEIGHT - 1; y++) {
  EDGE_CELLS.push({ x: 0, y }, { x: MAP_WIDTH - 1, y });
}

const START_TREE_COUNT = Math.round(MAP_WIDTH * MAP_HEIGHT * 0.05);
const START_ZOMBIE_COUNT = Math.round(EDGE_CELLS.length * 0.1);
const NEW_ZOMBIES_COUNT = Math.round(START_ZOMBIE_COUNT * 0.25);

const ZOMBIES_MOVE_INTERVAL = 500;
const ZOMBIES_GENERATE_INTERVAL = 30 * 1000;

export default class SurvivalOnlineGame extends GameEntity<EGame.SURVIVAL_ONLINE> {
  players: Player[] = [];
  map: IServerCell[][] = [];
  base: Base | null = null;
  zombies = new Set<Zombie>();

  *lifecycle() {
    this.generateWorld();

    yield* this.race([
      this.repeatTask(ZOMBIES_MOVE_INTERVAL, this.moveZombies),
      this.repeatTask(ZOMBIES_GENERATE_INTERVAL, function* () {
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
          biome: EBiome.GRASS,
          entity: null,
        });
      });
    });

    const baseCell = this.map[Math.floor(MAP_HEIGHT / 2)][Math.floor(MAP_WIDTH / 2)];

    this.base = this.spawnEntity(new Base(this, { cell: baseCell }));

    const cellsAroundBase = [
      this.map[baseCell.y][baseCell.x - 1],
      this.map[baseCell.y - 1][baseCell.x],
      this.map[baseCell.y][baseCell.x + 1],
      this.map[baseCell.y + 1][baseCell.x],
    ];

    this.players = this.getPlayersData((playerIndex) =>
      this.spawnEntity(
        new Player(this, {
          cell: cellsAroundBase[playerIndex],
          index: playerIndex,
        }),
      ),
    );

    for (let i = 0; i < START_TREE_COUNT; i++) {
      this.spawnEntity(new Tree(this, { cell: this.getRandomFreeCell() }));
    }

    this.spawnZombies(START_ZOMBIE_COUNT);
  }

  getCellInDirection(fromCell: IServerCell, direction: EDirection): IServerCell | null {
    const { x: dx, y: dy } = DIRECTIONS_DIFFS[direction];

    return this.map[fromCell.y + dy]?.[fromCell.x + dx] ?? null;
  }

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => this.players[playerIndex].toPlayerData());
  }

  getRandomFreeCell(): IServerCell {
    let cell: IServerCell;

    do {
      const randomIndex = Math.floor(Math.random() * MAP_WIDTH * MAP_HEIGHT);
      const y = Math.floor(randomIndex / MAP_WIDTH);
      const x = randomIndex % MAP_WIDTH;

      cell = this.map[y][x];
    } while (cell.entity);

    return cell;
  }

  moveEntityInDirection<Entity extends TMovingEntity>(
    entity: Entity,
    direction: EDirection,
  ): [] | [IServerCellWithEntity<Entity>] | [IServerCell, IServerCellWithEntity<Entity>] {
    const { cell } = entity;
    const cellInDirection = this.getCellInDirection(cell, direction);

    if (cellInDirection && !cellInDirection.entity) {
      entity.direction = direction;

      this.placeEntity(entity, cellInDirection);
      this.removeEntity(cell);

      if (entity instanceof Player) {
        this.players[entity.index].cell = cellInDirection as IServerCellWithEntity<Player>;
      }

      return [cell, cellInDirection as IServerCellWithEntity<Entity>];
    }

    if (entity.direction !== direction) {
      entity.direction = direction;

      return [entity.cell as IServerCellWithEntity<Entity>];
    }

    return [];
  }

  *moveZombies(): TGenerator {
    const cellsToUpdate: IServerCell[] = [];

    for (const zombie of this.zombies) {
      cellsToUpdate.push(...zombie.move());
    }

    this.sendGameUpdate([...new Set(cellsToUpdate)], false);
  }

  placeEntity<Entity extends TEntity>(entity: Entity, cell: IServerCell): void {
    cell.entity = entity;
  }

  removeEntity(cell: IServerCellWithEntity<TEntity>): void {
    (cell as IServerCell).entity = null;
  }

  sendGameUpdate(cells: IServerCell[], withPlayers: boolean): void {
    if (cells.length) {
      this.sendSocketEvent(EGameServerEvent.UPDATE_GAME, {
        cells: cells.map(this.transformCell),
        players: withPlayers ? this.getGamePlayers() : null,
      });
    }
  }

  *spawnZombie(cell: IServerCellWithEntity<Zombie>): TGenerator {
    const zombie = this.spawnEntity(new Zombie(this, { cell }));

    this.zombies.add(zombie);

    yield* zombie;

    this.zombies.delete(zombie);
  }

  spawnZombies(count: number): void {
    for (let i = 0; i < count; i++) {
      if (EDGE_CELLS.every(({ x, y }) => this.map[y][x].entity)) {
        break;
      }

      let zombieCell: IServerCell;

      do {
        const { x, y } = getRandomElement(EDGE_CELLS);

        zombieCell = this.map[y][x];
      } while (zombieCell.entity);

      this.spawnTask(this.spawnZombie(zombieCell as IServerCellWithEntity<Zombie>));
    }
  }

  transformCell = (cell: IServerCell): ICell => {
    return {
      x: cell.x,
      y: cell.y,
      biome: cell.biome,
      object: cell.entity?.toJSON() ?? null,
    };
  };

  toJSON(): IGame {
    return {
      map: this.map.map((row) => row.map(this.transformCell)),
      players: this.getGamePlayers(),
    };
  }
}
