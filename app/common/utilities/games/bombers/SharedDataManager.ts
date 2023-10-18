import { SECOND } from 'common/constants/date';
import {
  BOMBER_CELL_MARGIN,
  BOMBER_CELL_SIZE,
  CELLS_PER_SECOND,
  MAX_BOMB_COUNT,
  MAX_BOMB_RANGE,
  MAX_HP,
  MAX_SPEED,
  SPEED_INCREMENT,
  SUPER_SPEED,
} from 'common/constants/games/bombers';

import { Coords } from 'common/types';
import {
  BaseBuff,
  BonusType,
  BuffCosts,
  BuffType,
  Direction,
  Line,
  PlayerProperties,
} from 'common/types/games/bombers';

import Timestamp from 'common/utilities/Timestamp';
import { isFloatZero } from 'common/utilities/float';
import { isSuperSpeed } from 'common/utilities/games/bombers/buffs';
import getCoordsBehind from 'common/utilities/games/bombers/getCoordsBehind';
import getDirectionLine from 'common/utilities/games/bombers/getDirectionLine';

export interface MapObjectWithId {
  id: number;
}

export interface SharedCell<MapObject extends MapObjectWithId> {
  x: number;
  y: number;
  objects: MapObject[];
}

export type SharedMap<MapObject extends MapObjectWithId> = SharedCell<MapObject>[][];

export interface SharedPlayer<Buff extends BaseBuff> {
  coords: Coords;
  direction: Direction;
  startMovingTimestamp: Timestamp | null;
  properties: PlayerProperties;
  buffs: Set<Buff>;
}

export interface SharedBonus {
  type: BonusType;
}

export interface SharedDataManagerOptions<MapObject extends MapObjectWithId, Buff extends BaseBuff> {
  map: SharedMap<MapObject>;
  players: SharedPlayer<Buff>[];
  buffCosts: BuffCosts;
  isPassableObject(object: MapObject): boolean;
  deactivatePlayerBuff(buff: Buff, playerIndex: number): unknown;
}

interface ClosestCellInfo<MapObject extends MapObjectWithId> {
  cell: SharedCell<MapObject> | undefined;
  distance: number;
}

interface ClosestLineInfo {
  line: number;
  distance: number;
}

interface MovePlayerResult {
  distanceLeft: number;
  distanceWalked: number;
}

export default class SharedDataManager<MapObject extends MapObjectWithId, Buff extends BaseBuff> {
  map: SharedMap<MapObject>;
  players: SharedPlayer<Buff>[];
  buffCosts: BuffCosts;
  isPassableObject: SharedDataManagerOptions<MapObject, Buff>['isPassableObject'];
  deactivatePlayerBuffCallback: SharedDataManagerOptions<MapObject, Buff>['deactivatePlayerBuff'];

  constructor(options: SharedDataManagerOptions<MapObject, Buff>) {
    this.map = options.map;
    this.players = options.players;
    this.buffCosts = options.buffCosts;
    this.isPassableObject = options.isPassableObject;
    this.deactivatePlayerBuffCallback = options.deactivatePlayerBuff;
  }

  activatePlayerBuff(playerIndex: number, type: BuffType): Buff | null {
    const player = this.players[playerIndex];
    const buffCost = this.buffCosts[type];
    const { properties } = player;

    if (type === BuffType.SUPER_SPEED) {
      const amountFromReserve = Math.min(properties.speedReserve, buffCost);

      properties.speedReserve -= amountFromReserve;
      properties.speed -= buffCost - amountFromReserve;
    } else if (type === BuffType.SUPER_BOMB) {
      const amountFromReserve = Math.min(properties.maxBombCountReserve, buffCost);

      properties.maxBombCountReserve -= amountFromReserve;
      properties.maxBombCount -= buffCost - amountFromReserve;
    } else if (type === BuffType.SUPER_RANGE) {
      const amountFromReserve = Math.min(properties.bombRangeReserve, buffCost);

      properties.bombRangeReserve -= amountFromReserve;
      properties.bombRange -= buffCost - amountFromReserve;
    } else if (type === BuffType.INVINCIBILITY) {
      this.deactivatePlayerBuff(playerIndex, BuffType.BOMB_INVINCIBILITY);

      const amountFromReserve = Math.min(properties.hpReserve, buffCost);

      properties.hpReserve -= amountFromReserve;
      properties.hp -= buffCost - amountFromReserve;
    }

    return [...player.buffs].find((buff) => buff.type === type) ?? null;
  }

  canPlayerPassCell(player: SharedPlayer<Buff>, cell: SharedCell<MapObject> | undefined): boolean {
    return Boolean(
      cell?.objects.every((object) => [...player.buffs].some(isSuperSpeed) || this.isPassableObject(object)),
    );
  }

  consumePlayerBonus(playerIndex: number, bonus: SharedBonus): void {
    const player = this.players[playerIndex];
    const { properties } = player;

    if (bonus.type === BonusType.SPEED) {
      if (properties.speed >= MAX_SPEED) {
        properties.speedReserve++;
      } else {
        properties.speed++;
      }
    } else if (bonus.type === BonusType.BOMB_COUNT) {
      if (properties.maxBombCount >= MAX_BOMB_COUNT) {
        properties.maxBombCountReserve++;
      } else {
        properties.maxBombCount++;
      }
    } else if (bonus.type === BonusType.BOMB_RANGE) {
      if (properties.bombRange >= MAX_BOMB_RANGE) {
        properties.bombRangeReserve++;
      } else {
        properties.bombRange++;
      }
    } else if (bonus.type === BonusType.HP) {
      if (properties.hp >= MAX_HP) {
        properties.hpReserve++;
      } else {
        properties.hp++;
      }
    }
  }

  deactivatePlayerBuff(playerIndex: number, type: BuffType): void {
    const player = this.players[playerIndex];
    const buff = [...player.buffs].find((buff) => buff.type === type);

    if (buff) {
      this.deactivatePlayerBuffCallback(buff, playerIndex);
    }
  }

  getCell(coords: Coords): SharedCell<MapObject> | undefined {
    if (coords.x < 0 || coords.y < 0) {
      return;
    }

    return this.map.at(coords.y)?.at(coords.x);
  }

  getClosestCell(player: SharedPlayer<Buff>, direction: Direction): ClosestCellInfo<MapObject> {
    if (direction === Direction.DOWN) {
      const bottom = player.coords.y + BOMBER_CELL_SIZE / 2;

      return {
        cell: this.getCell({ x: Math.floor(player.coords.x), y: Math.ceil(bottom) }),
        distance: bottom % 1 && 1 - (bottom % 1),
      };
    }

    if (direction === Direction.UP) {
      const top = player.coords.y - BOMBER_CELL_SIZE / 2;

      return {
        cell: this.getCell({ x: Math.floor(player.coords.x), y: Math.floor(top) - 1 }),
        distance: top % 1,
      };
    }

    if (direction === Direction.RIGHT) {
      const right = player.coords.x + BOMBER_CELL_SIZE / 2;

      return {
        cell: this.getCell({ x: Math.ceil(right), y: Math.floor(player.coords.y) }),
        distance: right % 1 && 1 - (right % 1),
      };
    }

    const left = player.coords.x - BOMBER_CELL_SIZE / 2;

    return {
      cell: this.getCell({ x: Math.floor(left) - 1, y: Math.floor(player.coords.y) }),
      distance: left % 1,
    };
  }

  getClosestOrBehindCell(player: SharedPlayer<Buff>, direction: Direction): ClosestCellInfo<MapObject> {
    const closestCellInfo = this.getClosestCell(player, direction);
    const canPass = this.canPlayerPassCell(player, closestCellInfo.cell);

    if (!canPass || !isFloatZero(closestCellInfo.distance)) {
      return closestCellInfo;
    }

    return {
      cell: closestCellInfo.cell && this.getCell(getCoordsBehind(closestCellInfo.cell, direction)),
      distance: closestCellInfo.distance + 1,
    };
  }

  getClosestPlayerLine(player: SharedPlayer<Buff>, line: Line): ClosestLineInfo | null {
    const coord = line === Line.VERTICAL ? player.coords.x : player.coords.y;
    const closestLine = Math.floor(coord) + 0.5;
    const distance = Math.abs(coord - closestLine);

    return {
      line: closestLine,
      distance,
    };
  }

  getDesiredPlayerLine(player: SharedPlayer<Buff>): Line {
    return getDirectionLine(player.direction);
  }

  getPlayerLine(player: SharedPlayer<Buff>): Line {
    const isOnVertical = isFloatZero(player.coords.x % 0.5);
    const isOnHorizontal = isFloatZero(player.coords.y % 0.5);

    if ((player.direction === Direction.UP || player.direction === Direction.DOWN) && isOnVertical) {
      return Line.VERTICAL;
    }

    if ((player.direction === Direction.LEFT || player.direction === Direction.RIGHT) && isOnHorizontal) {
      return Line.HORIZONTAL;
    }

    return isOnVertical ? Line.VERTICAL : Line.HORIZONTAL;
  }

  getPlayerSpeed(player: SharedPlayer<Buff>): number {
    return [...player.buffs].some(isSuperSpeed) ? SUPER_SPEED : player.properties.speed;
  }

  healPlayer(playerIndex: number): boolean {
    const player = this.players[playerIndex];
    const { properties } = player;

    if (!properties.hpReserve || properties.hp === MAX_HP) {
      return false;
    }

    properties.hpReserve = 0;
    properties.hp++;

    return true;
  }

  movePlayer(playerIndex: number): MovePlayerResult {
    const player = this.players[playerIndex];
    const { startMovingTimestamp } = player;

    if (!startMovingTimestamp || startMovingTimestamp.timePassed <= 0) {
      return { distanceLeft: 0, distanceWalked: 0 };
    }

    const desiredLine = this.getDesiredPlayerLine(player);
    let distanceLeft =
      ((CELLS_PER_SECOND + this.getPlayerSpeed(player) * SPEED_INCREMENT) * startMovingTimestamp.timePassed) / SECOND;
    let distanceWalked = 0;
    let movingDirection = player.direction;

    while (!isFloatZero(distanceLeft)) {
      const line = this.getPlayerLine(player);
      const { cell: closestCell, distance: distanceToClosestCell } =
        line === desiredLine
          ? this.getClosestOrBehindCell(player, player.direction)
          : this.getClosestCell(player, player.direction);
      const canPass = this.canPlayerPassCell(player, closestCell);
      let distanceToPass: number;

      if (line === desiredLine) {
        movingDirection = player.direction;
        distanceToPass = canPass ? distanceToClosestCell : distanceToClosestCell - BOMBER_CELL_MARGIN;

        // in front of the object or map edge
        if (!canPass && (isFloatZero(distanceToPass) || distanceToPass < 0)) {
          break;
        }
      } else {
        if (!canPass) {
          break;
        }

        const closestLineInfo = this.getClosestPlayerLine(player, desiredLine);

        if (!closestLineInfo) {
          break;
        }

        const { line: closestLine, distance } = closestLineInfo;

        distanceToPass = distance;
        movingDirection =
          line === Line.VERTICAL
            ? closestLine < player.coords.y
              ? Direction.UP
              : Direction.DOWN
            : closestLine < player.coords.x
            ? Direction.LEFT
            : Direction.RIGHT;
      }

      const distancePassed = Math.min(distanceLeft, distanceToPass);

      distanceLeft -= distancePassed;
      distanceWalked += distancePassed;

      this.movePlayerDistance(player, distancePassed, movingDirection);

      if (isFloatZero(distancePassed)) {
        console.error('something went wrong');

        break;
      }
    }

    return {
      distanceLeft,
      distanceWalked,
    };
  }

  movePlayerDistance(player: SharedPlayer<Buff>, distance: number, direction: Direction): void {
    if (direction === Direction.UP) {
      player.coords.y -= distance;
    } else if (direction === Direction.DOWN) {
      player.coords.y += distance;
    } else if (direction === Direction.LEFT) {
      player.coords.x -= distance;
    } else if (direction === Direction.RIGHT) {
      player.coords.x += distance;
    }
  }

  removeMapObject(id: number, coords: Coords): void {
    const { objects } = this.map[coords.y][coords.x];

    const wallIndex = objects.findIndex((object) => object.id === id);

    if (wallIndex !== -1) {
      objects.splice(wallIndex, 1);
    }
  }
}
