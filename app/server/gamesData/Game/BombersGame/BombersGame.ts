import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { EXPLOSION_TICK_DURATION, EXPLOSION_TICKS_COUNT, MAPS, TIME_TO_START } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import {
  EBonus,
  EDirection,
  EGameServerEvent,
  EMap,
  EObject,
  EPlayerColor,
  IExplodedBomb,
  IExplodedBox,
  IGame,
  IGameResult,
  IPlayer,
  TMap,
} from 'common/types/bombers';
import { ICoords } from 'common/types';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TGenerator, TParentOrContext } from 'server/gamesData/Game/utilities/Entity';
import { now } from 'server/utilities/time';
import SharedDataManager from 'common/utilities/bombers/SharedDataManager';
import getCoordsBehind from 'common/utilities/bombers/getCoordsBehind';
import { getRandomElement } from 'common/utilities/random';

import Bomb, { IBombOptions } from 'server/gamesData/Game/BombersGame/entities/Bomb';
import Bonus from 'server/gamesData/Game/BombersGame/entities/Bonus';
import Box from 'server/gamesData/Game/BombersGame/entities/Box';
import Player, { IPlayerOptions } from 'server/gamesData/Game/BombersGame/entities/Player';
import Wall from 'server/gamesData/Game/BombersGame/entities/Wall';

export type TServerMapObject = Bomb | Bonus | Box | Wall;

export interface IServerCell {
  x: number;
  y: number;
  object: TServerMapObject | null;
}

export type TServerMap = IServerCell[][];

type TMapLayout = (EObject.BOX | EObject.WALL | number | null)[][];

const FRAME_DURATION = 1000 / 60;

const ALL_MAPS = Object.values(EMap);

export default class BombersGame extends GameEntity<EGame.BOMBERS> {
  players: Player[] = [];
  map: TServerMap = [];
  startsAt = Date.now() + TIME_TO_START;
  canControl = false;
  sharedDataManager: SharedDataManager<TServerMapObject>;
  mapType: EMap;
  mapLayout: TMapLayout;
  mapWidth: number;
  mapHeight: number;
  bombsToExplode: Bomb[][] = times(EXPLOSION_TICKS_COUNT, () => []);
  boxes = new Set<Box>();
  alivePlayers = new Set<Player>();
  lastExplosionTickTimestamp = 0;
  artificialWallsPath: IServerCell[] = [];
  artificialWallsSpawned = 0;

  constructor(parentOrContext: TParentOrContext<EGame.BOMBERS>) {
    super(parentOrContext);

    this.mapType = this.options.mapType ?? getRandomElement(ALL_MAPS);
    this.mapLayout = this.getMapLayout();
    this.mapWidth = this.mapLayout[0].length;
    this.mapHeight = this.mapLayout.length;

    this.sharedDataManager = new SharedDataManager<TServerMapObject>({
      map: this.map,
      players: this.players,
      isPassableObject: this.isPassableObject,
    });
  }

  *lifecycle(): TGenerator<IGameResult> {
    this.spawnTask(this.pingIndefinitely(1000));

    this.map = this.sharedDataManager.map = this.mapLayout.map((row, y) => {
      return row.map((objectType, x) => {
        return {
          x,
          y,
          object: null,
        };
      });
    });
    this.artificialWallsPath = this.getArtificialWallsPath();

    const spawnPoints: ICoords[] = [];
    const colors = shuffle(Object.values(EPlayerColor));

    this.mapLayout.forEach((row, y) => {
      row.forEach((objectType, x) => {
        if (objectType === EObject.WALL) {
          this.createWall({ x, y }, false);
        } else if (objectType === EObject.BOX) {
          this.spawnTask(this.spawnBox({ x, y }));
        } else if (typeof objectType === 'number') {
          spawnPoints[objectType] = { x: x + 0.5, y: y + 0.5 };
        }
      });
    });

    // spawnPoints = shuffle(spawnPoints);

    this.forEachPlayer((playerIndex) => {
      this.spawnTask(
        this.spawnPlayer({
          index: playerIndex,
          coords: spawnPoints[playerIndex],
          color: colors[playerIndex],
        }),
      );
    });

    yield* this.delay(this.startsAt - Date.now());

    this.players.forEach((player) => {
      player.grantControls();
    });

    this.canControl = true;

    this.sendSocketEvent(EGameServerEvent.CAN_CONTROL);

    this.lastExplosionTickTimestamp = now();

    this.spawnTask(this.repeatTask(EXPLOSION_TICK_DURATION, this.explodeBombs));

    yield* this.race([
      this.waitForWinner(),
      this.all([this.spawnArtificialWalls(), this.repeatTask(FRAME_DURATION, this.movePlayers)]),
    ]);

    this.players.forEach((player) => {
      player.disable();
    });

    return {
      winner: [...this.alivePlayers].at(0)?.index ?? null,
    };
  }

  createWall(coords: ICoords, isArtificial: boolean): void {
    this.spawnTask(this.spawnWall(coords, isArtificial));
  }

  *explodeBombs(): TGenerator {
    const bombsToExplode = this.bombsToExplode.shift();

    this.bombsToExplode.push([]);

    if (!bombsToExplode?.length) {
      return;
    }

    const hitPlayers = new Set<number>();
    const explodedBombs: IExplodedBomb[] = [];
    const explodedBoxes = new Set<Box>();
    const explodedBoxesInfo: IExplodedBox[] = [];
    const invincibilityEndsAt = now() + 1200;

    bombsToExplode.forEach((bomb) => {
      const { hitPlayers: bombHitPlayers, explodedBoxes: bombExplodedBoxes, explodedDirections } = bomb.explode();

      explodedBombs.push({
        coords: this.getCellCoords(bomb.cell),
        explodedDirections,
      });

      bombHitPlayers.forEach((playerIndex) => {
        if (!this.players[playerIndex].isInvincible) {
          hitPlayers.add(playerIndex);
        }
      });

      bombExplodedBoxes.forEach((explodedBox) => {
        explodedBoxes.add(explodedBox);
      });
    });

    hitPlayers.forEach((playerIndex) => {
      this.players[playerIndex].hit({ damage: 1, invincibilityEndsAt });
    });

    explodedBoxes.forEach((explodedBox) => {
      explodedBox.explode();

      let bonus: Bonus | null = null;

      if (explodedBox.cell.object instanceof Bonus) {
        bonus = explodedBox.cell.object;
      }

      explodedBoxesInfo.push({
        bonus: bonus?.toJSON() ?? null,
        coords: this.getCellCoords(explodedBox.cell),
      });
    });

    this.sendSocketEvent(EGameServerEvent.BOMBS_EXPLODED, {
      bombs: explodedBombs,
      hitPlayers: [...hitPlayers],
      explodedBoxes: explodedBoxesInfo,
      invincibilityEndsAt: now() + 1000,
    });
  }

  getArtificialWallsPath(): IServerCell[] {
    const directionsRotation = [EDirection.RIGHT, EDirection.DOWN, EDirection.LEFT, EDirection.UP];
    let currentCell: IServerCell = this.map[0][0];
    let currentDirection = EDirection.RIGHT;
    let justRotated = false;

    const wallsPath: IServerCell[] = [currentCell];

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

  getCell(coords: ICoords): IServerCell | undefined {
    if (coords.x < 0 || coords.y < 0) {
      return;
    }

    return this.map.at(coords.y)?.at(coords.x);
  }

  getCellBehind(cell: IServerCell, direction: EDirection): IServerCell | undefined {
    return this.getCell(getCoordsBehind(cell, direction));
  }

  getCellCoords(cell: IServerCell): ICoords {
    return {
      x: cell.x,
      y: cell.y,
    };
  }

  getClientMap(): TMap {
    return this.map.map((row) => {
      return row.map((cell) => {
        return {
          ...this.getCellCoords(cell),
          object: cell.object?.toJSON() ?? null,
        };
      });
    });
  }

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => this.players[playerIndex].toJSON());
  }

  getMapLayout(): TMapLayout {
    const stringLayout = MAPS[this.mapType];

    return stringLayout
      .trim()
      .split('\n')
      .map((row) =>
        [...row.trim()].map((char) => {
          if (char === 'w') {
            return EObject.WALL;
          }

          if (char === 'b') {
            return EObject.BOX;
          }

          const number = Number(char);

          return Number.isNaN(number) ? null : number;
        }),
      );
  }

  isPassableObject(object: TServerMapObject | null | undefined): boolean {
    return object === null || object instanceof Bonus;
  }

  isExplosionPassableObject(object: TServerMapObject | null | undefined): boolean {
    return object === null || object instanceof Bonus || object instanceof Bomb;
  }

  *movePlayers(): TGenerator {
    this.players.forEach((player) => player.move());
  }

  placeBomb(player: Player, cell: IServerCell): void {
    this.spawnTask(
      this.spawnBomb(player, {
        cell,
        range: player.bombRange,
        explodesAt: this.lastExplosionTickTimestamp + EXPLOSION_TICKS_COUNT * EXPLOSION_TICK_DURATION,
      }),
    );
  }

  placeMapObject(object: TServerMapObject, cell: IServerCell): void {
    cell.object = object;
  }

  removeMapObject(cell: IServerCell, object: TServerMapObject): void {
    if (cell.object === object) {
      cell.object = null;
    }
  }

  *spawnArtificialWall(): TGenerator<undefined | true> {
    const cell = this.artificialWallsPath.at(this.artificialWallsSpawned);

    if (!cell) {
      return true;
    }

    this.artificialWallsSpawned++;

    const { object } = cell;

    if (object instanceof Wall) {
      return;
    }

    if (object instanceof Bonus) {
      object.consume();
    }

    this.createWall(cell, true);
  }

  *spawnArtificialWalls(): TGenerator {
    while (this.boxes.size > 0) {
      yield* this.race([...this.boxes]);
    }

    yield* this.delay(5 * 1000);

    yield* this.repeatTask(1000, this.spawnArtificialWall);
  }

  *spawnBomb(player: Player, options: IBombOptions): TGenerator {
    const { cell } = options;

    if (cell.object || !player.canPlaceBombs()) {
      return;
    }

    const bomb = this.spawnEntity(new Bomb(this, options));

    this.placeMapObject(bomb, cell);
    player.placeBomb(bomb);
    this.bombsToExplode.at(-1)?.push(bomb);

    this.sendSocketEvent(EGameServerEvent.PLACE_BOMB, {
      coords: this.getCellCoords(cell),
      bomb: bomb.toJSON(),
    });

    yield* bomb;

    player.removeBomb(bomb);
    this.removeMapObject(cell, bomb);
  }

  *spawnBonus(type: EBonus, cell: IServerCell): TGenerator {
    const bonus = this.spawnEntity(new Bonus(this, { type }));

    this.placeMapObject(bonus, cell);

    yield* bonus;

    this.removeMapObject(cell, bonus);
  }

  *spawnBox(coords: ICoords): TGenerator {
    const cell = this.getCell(coords);

    if (!cell) {
      return;
    }

    const box = this.spawnEntity(new Box(this, { cell }));

    this.placeMapObject(box, cell);
    this.boxes.add(box);

    const bonusType = yield* box;

    this.boxes.delete(box);
    this.removeMapObject(cell, box);

    if (bonusType) {
      this.spawnTask(this.spawnBonus(bonusType, cell));
    }
  }

  *spawnPlayer(options: IPlayerOptions): TGenerator {
    const player = this.spawnEntity(new Player(this, options));

    this.players.push(player);
    this.alivePlayers.add(player);

    yield* player;

    this.alivePlayers.delete(player);
  }

  *spawnWall(coords: ICoords, isArtificial: boolean): TGenerator {
    const cell = this.getCell(coords);

    if (!cell) {
      return;
    }

    const wall = this.spawnEntity(new Wall(this, { cell, isArtificial }));

    this.placeMapObject(wall, cell);

    yield* wall;

    this.removeMapObject(cell, wall);
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
      map: this.getClientMap(),
      mapType: this.mapType,
      startsAt: this.startsAt,
      canControl: this.canControl,
    };
  }

  *waitForWinner(): TGenerator {
    const finishGamePlayersCount = Math.min(this.playersCount - 1, 1);

    while (this.alivePlayers.size > finishGamePlayersCount) {
      yield* this.race([...this.alivePlayers]);
    }

    yield* this.delay(0);
  }
}
