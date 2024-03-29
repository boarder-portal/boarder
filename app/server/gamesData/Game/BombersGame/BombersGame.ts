import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { SECOND } from 'common/constants/date';
import {
  DEFAULT_BUFF_COSTS,
  EXPLOSION_TICKS_COUNT,
  EXPLOSION_TICK_DURATION,
  MAPS,
  RESET_WALLS_TIMEOUT,
  START_SPAWN_WALLS_TIMEOUT,
  START_SPAWN_WALL_TIMEOUT,
  SUPER_RANGE,
  TIME_TO_START,
} from 'common/constants/games/bombers';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import {
  BonusType,
  BuffCosts,
  DestroyedWall,
  Direction,
  ExplodedBomb,
  ExplodedBox,
  Game,
  GameEventType,
  GameResult,
  GameServerEventType,
  Map as MapModel,
  MapType,
  ObjectType,
  PlayerColor,
  Player as PlayerModel,
} from 'common/types/games/bombers';

import Timestamp from 'common/utilities/Timestamp';
import SharedDataManager from 'common/utilities/games/bombers/SharedDataManager';
import { isBombInvincibility, isInvincibility, isSuperBomb, isSuperRange } from 'common/utilities/games/bombers/buffs';
import getCoordsBehind from 'common/utilities/games/bombers/getCoordsBehind';
import { getRandomElement } from 'common/utilities/random';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import TestCase from 'server/gamesData/Game/utilities/Entity/components/TestCase';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';

import Bomb, { BombOptions } from 'server/gamesData/Game/BombersGame/entities/Bomb';
import Bonus from 'server/gamesData/Game/BombersGame/entities/Bonus';
import Box from 'server/gamesData/Game/BombersGame/entities/Box';
import Player, { PlayerOptions } from 'server/gamesData/Game/BombersGame/entities/Player';
import Wall from 'server/gamesData/Game/BombersGame/entities/Wall';

export type ServerMapObject = Bomb | Bonus | Box | Wall;

export interface ServerCell {
  x: number;
  y: number;
  objects: ServerMapObject[];
}

export type ServerMap = ServerCell[][];

type MapLayout = (ObjectType.BOX | ObjectType.WALL | number | null)[][];

const FRAME_DURATION = SECOND / 60;

const ALL_MAPS = Object.values(MapType);

export default class BombersGame extends Entity<GameResult> {
  static isBomb(object: ServerMapObject): object is Bomb {
    return object instanceof Bomb;
  }

  static isBonus(object: ServerMapObject): object is Bonus {
    return object instanceof Bonus;
  }

  static isBox(object: ServerMapObject): object is Box {
    return object instanceof Box;
  }

  static isPassableObject(object: ServerMapObject): boolean {
    return BombersGame.isBonus(object);
  }

  static isWall(object: ServerMapObject): object is Wall {
    return object instanceof Wall;
  }

  testCase = this.getClosestComponent(TestCase<GameType.BOMBERS>);

  time = this.addComponent(Time<this>, {
    getBoundTimestamps: (): Timestamp[] => [this.startsAt, this.lastExplosionTickTimestamp],
    isPauseAvailable: () => true,
    afterPause: () => {
      this.setCanControl(false);
    },
    afterUnpause: () => {
      this.setCanControl(true);
    },
  });
  gameInfo = this.obtainComponent(GameInfo<GameType.BOMBERS, this>);
  server = this.obtainComponent(Server<GameType.BOMBERS, this>);

  objectId = 0;
  players: Player[] = [];
  map: ServerMap = [];
  started = false;
  startsAt = this.time.createTimestamp(TIME_TO_START);
  canControl = false;
  isDamagingBombs = true;
  mapType = this.gameInfo.options.mapType ?? getRandomElement(ALL_MAPS);
  mapLayout = this.getMapLayout();
  buffCosts: BuffCosts = {
    ...DEFAULT_BUFF_COSTS,
  };
  sharedDataManager = new SharedDataManager({
    map: this.map,
    players: this.players,
    buffCosts: this.buffCosts,
    isPassableObject: BombersGame.isPassableObject,
    deactivatePlayerBuff: (buff) => {
      buff.player.buffs.delete(buff);

      this.server.sendSocketEvent(GameServerEventType.BUFF_DEACTIVATED, {
        playerIndex: buff.player.index,
        type: buff.type,
      });
    },
  });
  bombsToExplode: Bomb[][] = times(EXPLOSION_TICKS_COUNT, () => []);
  boxes = new Set<Box>();
  alivePlayers = new Set<Player>();
  lastExplosionTickTimestamp = this.time.createTimestamp();
  artificialWalls: Wall[] = [];
  artificialWallsPath: ServerCell[] = [];
  artificialWallsSpawned = 0;
  artificialWallsSpawnInterval = START_SPAWN_WALL_TIMEOUT;

  *lifecycle(): EntityGenerator<GameResult> {
    this.testCase.dispatchGameEvent(GameEventType.GAME_STARTED, this);

    this.spawnTask(this.server.pingIndefinitely(SECOND));

    this.map = this.sharedDataManager.map = this.mapLayout.map((row, y) =>
      row.map((objectType, x) => ({
        x,
        y,
        objects: [],
      })),
    );
    this.artificialWallsPath = this.getArtificialWallsPath();

    const spawnPoints: Coords[] = [];
    const colors = shuffle(Object.values(PlayerColor));

    this.mapLayout.forEach((row, y) => {
      row.forEach((objectType, x) => {
        if (objectType === ObjectType.WALL) {
          this.createWall({ x, y }, false);
        } else if (objectType === ObjectType.BOX) {
          this.spawnTask(this.spawnBox({ x, y }));
        } else if (typeof objectType === 'number') {
          spawnPoints[objectType] = { x: x + 0.5, y: y + 0.5 };
        }
      });
    });

    // spawnPoints = shuffle(spawnPoints);

    this.gameInfo.forEachPlayer((playerIndex) => {
      this.spawnTask(
        this.spawnPlayer({
          index: playerIndex,
          coords: spawnPoints[playerIndex],
          color: colors[playerIndex],
        }),
      );
    });

    yield* this.time.waitForTimestamp(this.startsAt);

    this.players.forEach((player) => {
      player.grantControls();
    });

    this.started = true;

    this.setCanControl(true);

    this.lastExplosionTickTimestamp = this.time.createTimestamp();

    this.spawnTask(this.time.repeatTask(EXPLOSION_TICK_DURATION, this.explodeBombs));

    yield* this.race([
      this.waitForWinner(),
      this.all([this.spawnArtificialWalls(), this.time.repeatTask(FRAME_DURATION, this.movePlayers)]),
    ]);

    this.players.forEach((player) => {
      player.disable();
    });

    this.isDamagingBombs = false;

    return {
      winner: [...this.alivePlayers].at(0)?.index ?? null,
    };
  }

  createWall(coords: Coords, isArtificial: boolean): void {
    this.spawnTask(this.spawnWall(coords, isArtificial));
  }

  *explodeBombs(): EntityGenerator {
    const bombsToExplode = this.bombsToExplode.shift();

    this.bombsToExplode.push([]);

    this.lastExplosionTickTimestamp = this.time.createTimestamp();

    if (!bombsToExplode?.length) {
      return;
    }

    const hitPlayers = new Map<number, number>();
    const explodedBombs: ExplodedBomb[] = [];
    const explodedBoxes = new Set<Box>();
    const destroyedWalls = new Set<Wall>();
    const explodedBoxesInfo: ExplodedBox[] = [];
    const destroyedWallsInfo: DestroyedWall[] = [];

    bombsToExplode.forEach((bomb) => {
      const {
        hitPlayers: bombHitPlayers,
        explodedBoxes: bombExplodedBoxes,
        destroyedWalls: bombExplodedWalls,
        explodedDirections,
      } = bomb.explode();

      explodedBombs.push({
        id: bomb.id,
        coords: this.getCellCoords(bomb.cell),
        explodedDirections,
      });

      if (this.isDamagingBombs) {
        bombHitPlayers.forEach(({ index, damage }) => {
          if ([...this.players[index].buffs].every((buff) => !isInvincibility(buff) && !isBombInvincibility(buff))) {
            hitPlayers.set(index, Math.max(hitPlayers.get(index) ?? 0, damage));
          }
        });
      }

      bombExplodedBoxes.forEach((explodedBox) => {
        explodedBoxes.add(explodedBox);
      });

      bombExplodedWalls.forEach((explodedWall) => {
        destroyedWalls.add(explodedWall);
      });
    });

    for (const [playerIndex, damage] of hitPlayers.entries()) {
      this.players[playerIndex].hit(damage);
    }

    explodedBoxes.forEach((explodedBox) => {
      explodedBox.explode();

      const bonuses = explodedBox.cell.objects.filter(BombersGame.isBonus);

      explodedBoxesInfo.push({
        id: explodedBox.id,
        bonuses: bonuses.map((bonus) => bonus.toJSON()),
        coords: this.getCellCoords(explodedBox.cell),
      });
    });

    destroyedWalls.forEach((explodedWall) => {
      explodedWall.break();

      destroyedWallsInfo.push({
        id: explodedWall.id,
        coords: this.getCellCoords(explodedWall.cell),
      });
    });

    this.server.sendSocketEvent(GameServerEventType.BOMBS_EXPLODED, {
      bombs: explodedBombs,
      hitPlayers: [...hitPlayers.entries()].map(([index, damage]) => ({ index, damage })),
      explodedBoxes: explodedBoxesInfo,
      destroyedWalls: destroyedWallsInfo,
    });
  }

  getArtificialWallsPath(): ServerCell[] {
    const directionsRotation = [Direction.RIGHT, Direction.DOWN, Direction.LEFT, Direction.UP];
    let currentCell: ServerCell = this.map[0][0];
    let currentDirection = Direction.RIGHT;
    let justRotated = false;

    const wallsPath: ServerCell[] = [currentCell];

    while (true) {
      const cellBehind = this.getCellBehind(currentCell, currentDirection);

      if (!cellBehind || wallsPath.includes(cellBehind)) {
        if (justRotated) {
          break;
        }

        currentDirection = directionsRotation[(directionsRotation.indexOf(currentDirection) + 1) % 4];
        justRotated = true;

        continue;
      }

      currentCell = cellBehind;
      justRotated = false;

      wallsPath.push(currentCell);
    }

    return wallsPath;
  }

  getCell(coords: Coords): ServerCell | undefined {
    if (coords.x < 0 || coords.y < 0) {
      return;
    }

    return this.map.at(coords.y)?.at(coords.x);
  }

  getCellBehind(cell: ServerCell, direction: Direction): ServerCell | undefined {
    return this.getCell(getCoordsBehind(cell, direction));
  }

  getCellCoords(cell: ServerCell): Coords {
    return {
      x: cell.x,
      y: cell.y,
    };
  }

  getClientMap(): MapModel {
    return this.map.map((row) => {
      return row.map((cell) => {
        return {
          ...this.getCellCoords(cell),
          objects: cell.objects.map((object) => object.toJSON()),
        };
      });
    });
  }

  getGamePlayers(): PlayerModel[] {
    return this.gameInfo.getPlayersWithData((playerIndex) => this.players[playerIndex].toJSON());
  }

  getMapLayout(): MapLayout {
    const stringLayout = MAPS[this.mapType];

    return stringLayout
      .trim()
      .split('\n')
      .map((row) =>
        [...row.trim()].map((char) => {
          if (char === 'w') {
            return ObjectType.WALL;
          }

          if (char === 'b') {
            return ObjectType.BOX;
          }

          const number = Number(char);

          return Number.isNaN(number) ? null : number;
        }),
      );
  }

  getNewObjectId(): number {
    return ++this.objectId;
  }

  isExplosionPassableObject(object: ServerMapObject): boolean {
    return object === null || BombersGame.isBonus(object) || BombersGame.isBomb(object);
  }

  *movePlayers(): EntityGenerator {
    this.players.forEach((player) => player.move());
  }

  placeBomb(player: Player, cell: ServerCell): void {
    if (cell.objects.some(BombersGame.isBomb) || !player.canPlaceBombs()) {
      return;
    }

    const hasSuperRange = [...player.buffs].some(isSuperRange);

    this.spawnTask(
      this.spawnBomb(player, {
        cell,
        id: this.getNewObjectId(),
        range: hasSuperRange ? SUPER_RANGE : player.properties.bombRange,
        explodesAt: this.time.createTimestamp(
          EXPLOSION_TICKS_COUNT * EXPLOSION_TICK_DURATION - this.lastExplosionTickTimestamp.timePassed,
        ),
        isSuperBomb: [...player.buffs].some(isSuperBomb),
        isSuperRange: hasSuperRange,
      }),
    );
  }

  placeMapObject(object: ServerMapObject, cell: ServerCell): void {
    cell.objects.push(object);
  }

  removeMapObject(cell: ServerCell, object: ServerMapObject): void {
    this.sharedDataManager.removeMapObject(object.id, cell);
  }

  setCanControl(canControl: boolean): void {
    this.canControl = this.started && canControl;

    this.server.sendSocketEvent(GameServerEventType.CAN_CONTROL, this.canControl);
  }

  *spawnArtificialWall(): EntityGenerator<boolean> {
    const cell = this.artificialWallsPath.at(this.artificialWallsSpawned);

    if (!cell) {
      return false;
    }

    this.artificialWallsSpawned++;

    const { objects } = cell;

    if (objects.some(BombersGame.isWall)) {
      return true;
    }

    objects.filter(BombersGame.isBonus).forEach((bonus) => {
      bonus.consume();
    });

    this.createWall(cell, true);

    return true;
  }

  *spawnArtificialWalls(): EntityGenerator {
    while (true) {
      while (this.boxes.size > 0) {
        yield* this.race([...this.boxes].map((box) => this.waitForEntity(box)));
      }

      yield* this.time.delay(START_SPAWN_WALLS_TIMEOUT);

      yield* this.time.repeatTask(this.artificialWallsSpawnInterval, function* (): EntityGenerator<boolean | void> {
        const spawnedWall = yield* this.spawnArtificialWall();

        if (!spawnedWall) {
          return false;
        }
      });

      yield* this.time.delay(RESET_WALLS_TIMEOUT);

      this.artificialWalls.forEach((wall) => {
        wall.break();
      });

      this.artificialWallsSpawned = 0;
      this.artificialWallsSpawnInterval /= 2;

      this.server.sendSocketEvent(
        GameServerEventType.WALLS_DESTROYED,
        this.artificialWalls.map((wall) => ({
          id: wall.id,
          coords: this.getCellCoords(wall.cell),
        })),
      );
    }
  }

  *spawnBomb(player: Player, options: BombOptions): EntityGenerator {
    const { cell } = options;

    const bomb = this.spawnEntity(Bomb, options);

    this.placeMapObject(bomb, cell);
    player.placeBomb(bomb);
    this.bombsToExplode.at(-1)?.push(bomb);

    this.server.sendSocketEvent(GameServerEventType.PLACE_BOMB, {
      coords: this.getCellCoords(cell),
      bomb: bomb.toJSON(),
    });

    yield* this.waitForEntity(bomb);

    player.removeBomb(bomb);
    this.removeMapObject(cell, bomb);
  }

  *spawnBonus(type: BonusType, cell: ServerCell): EntityGenerator {
    const bonus = this.spawnEntity(Bonus, {
      id: this.getNewObjectId(),
      type,
    });

    this.placeMapObject(bonus, cell);

    yield* this.waitForEntity(bonus);

    this.removeMapObject(cell, bonus);
  }

  *spawnBox(coords: Coords): EntityGenerator {
    const cell = this.getCell(coords);

    if (!cell) {
      return;
    }

    const box = this.spawnEntity(Box, {
      id: this.getNewObjectId(),
      cell,
    });

    this.placeMapObject(box, cell);
    this.boxes.add(box);

    const bonusType = yield* this.waitForEntity(box);

    this.boxes.delete(box);
    this.removeMapObject(cell, box);

    if (bonusType) {
      this.spawnTask(this.spawnBonus(bonusType, cell));
    }
  }

  *spawnPlayer(options: PlayerOptions): EntityGenerator {
    const player = this.spawnEntity(Player, options);

    this.players.push(player);
    this.alivePlayers.add(player);

    yield* this.waitForEntity(player);

    this.alivePlayers.delete(player);
  }

  *spawnWall(coords: Coords, isArtificial: boolean): EntityGenerator {
    const cell = this.getCell(coords);

    if (!cell) {
      return;
    }

    const wall = this.spawnEntity(Wall, {
      id: this.getNewObjectId(),
      cell,
      isArtificial,
    });

    this.placeMapObject(wall, cell);

    if (isArtificial) {
      this.artificialWalls.push(wall);
    }

    yield* this.waitForEntity(wall);

    this.removeMapObject(cell, wall);
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      map: this.getClientMap(),
      mapType: this.mapType,
      startsAt: this.startsAt,
      canControl: this.canControl,
      buffCosts: this.buffCosts,
    };
  }

  *waitForWinner(): EntityGenerator {
    const finishGamePlayersCount = Math.min(this.gameInfo.playersCount - 1, 1);

    while (this.alivePlayers.size > finishGamePlayersCount) {
      yield* this.race([...this.alivePlayers].map((player) => this.waitForEntity(player)));
    }

    yield* this.time.delay(5 * FRAME_DURATION);
  }
}
