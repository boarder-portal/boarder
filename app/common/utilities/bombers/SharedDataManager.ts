import { SECOND } from 'common/constants/date';
import {
  BOMBER_CELL_MARGIN,
  BOMBER_CELL_SIZE,
  CELLS_PER_SECOND,
  INVINCIBILITY_COST,
  MAX_BOMB_COUNT,
  MAX_BOMB_RANGE,
  MAX_HP,
  MAX_SPEED,
  SPEED_INCREMENT,
  SUPER_BOMB_COST,
  SUPER_RANGE_COST,
  SUPER_SPEED,
  SUPER_SPEED_COST,
} from 'common/constants/games/bombers';

import { Coords, Timestamp } from 'common/types';
import { BonusType, Buff, BuffType, Direction, Line } from 'common/types/games/bombers';

import { isSuperSpeed } from 'common/utilities/bombers/buffs';
import getCoordsBehind from 'common/utilities/bombers/getCoordsBehind';
import getDirectionLine from 'common/utilities/bombers/getDirectionLine';
import { isFloatZero } from 'common/utilities/float';

export interface MapObjectWithId {
  id: number;
}

export interface SharedCell<MapObject extends MapObjectWithId> {
  x: number;
  y: number;
  objects: MapObject[];
}

export type SharedMap<MapObject extends MapObjectWithId> = SharedCell<MapObject>[][];

export interface SharedPlayer {
  coords: Coords;
  direction: Direction;
  startMovingTimestamp: Timestamp | null;
  speed: number;
  speedReserve: number;
  maxBombCount: number;
  maxBombCountReserve: number;
  bombRange: number;
  bombRangeReserve: number;
  hp: number;
  hpReserve: number;
  buffs: Buff[];
}

export interface SharedBonus {
  type: BonusType;
}

export interface SharedDataManagerOptions<MapObject extends MapObjectWithId> {
  map: SharedMap<MapObject>;
  players: SharedPlayer[];
  isPassableObject(object: MapObject): boolean;
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

export default class SharedDataManager<MapObject extends MapObjectWithId> {
  map: SharedMap<MapObject>;
  players: SharedPlayer[];
  isPassableObject: SharedDataManagerOptions<MapObject>['isPassableObject'];

  constructor(options: SharedDataManagerOptions<MapObject>) {
    this.map = options.map;
    this.players = options.players;
    this.isPassableObject = options.isPassableObject;
  }

  activatePlayerBuff(playerIndex: number, type: BuffType, endsAt: Timestamp): Buff {
    const player = this.players[playerIndex];

    if (type === BuffType.SUPER_SPEED) {
      const amountFromReserve = Math.min(player.speedReserve, SUPER_SPEED_COST);

      player.speedReserve -= amountFromReserve;
      player.speed -= SUPER_SPEED_COST - amountFromReserve;
    } else if (type === BuffType.SUPER_BOMB) {
      const amountFromReserve = Math.min(player.maxBombCountReserve, SUPER_BOMB_COST);

      player.maxBombCountReserve -= amountFromReserve;
      player.maxBombCount -= SUPER_BOMB_COST - amountFromReserve;
    } else if (type === BuffType.SUPER_RANGE) {
      const amountFromReserve = Math.min(player.bombRangeReserve, SUPER_RANGE_COST);

      player.bombRangeReserve -= amountFromReserve;
      player.bombRange -= SUPER_RANGE_COST - amountFromReserve;
    } else if (type === BuffType.INVINCIBILITY) {
      this.deactivatePlayerBuff(playerIndex, BuffType.BOMB_INVINCIBILITY);

      const amountFromReserve = Math.min(player.hpReserve, INVINCIBILITY_COST);

      player.hpReserve -= amountFromReserve;
      player.hp -= INVINCIBILITY_COST - amountFromReserve;
    }

    const activeBuff = player.buffs.find((buff) => buff.type === type);

    if (activeBuff) {
      activeBuff.endsAt = endsAt;

      return activeBuff;
    }

    const newBuff: Buff = {
      type,
      endsAt,
    };

    player.buffs.push(newBuff);

    return newBuff;
  }

  canPlayerPassCell(player: SharedPlayer, cell: SharedCell<MapObject> | undefined): boolean {
    return Boolean(cell?.objects.every((object) => player.buffs.some(isSuperSpeed) || this.isPassableObject(object)));
  }

  consumePlayerBonus(playerIndex: number, bonus: SharedBonus): void {
    const player = this.players[playerIndex];

    if (bonus.type === BonusType.SPEED) {
      if (player.speed >= MAX_SPEED) {
        player.speedReserve++;
      } else {
        player.speed++;
      }
    } else if (bonus.type === BonusType.BOMB_COUNT) {
      if (player.maxBombCount >= MAX_BOMB_COUNT) {
        player.maxBombCountReserve++;
      } else {
        player.maxBombCount++;
      }
    } else if (bonus.type === BonusType.BOMB_RANGE) {
      if (player.bombRange >= MAX_BOMB_RANGE) {
        player.bombRangeReserve++;
      } else {
        player.bombRange++;
      }
    } else if (bonus.type === BonusType.HP) {
      if (player.hp >= MAX_HP) {
        player.hpReserve++;
      } else {
        player.hp++;
      }
    }
  }

  deactivatePlayerBuff(playerIndex: number, type: BuffType): void {
    const player = this.players[playerIndex];

    player.buffs = player.buffs.filter((buff) => buff.type !== type);
  }

  getCell(coords: Coords): SharedCell<MapObject> | undefined {
    if (coords.x < 0 || coords.y < 0) {
      return;
    }

    return this.map.at(coords.y)?.at(coords.x);
  }

  getClosestCell(player: SharedPlayer, direction: Direction): ClosestCellInfo<MapObject> {
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

  getClosestOrBehindCell(player: SharedPlayer, direction: Direction): ClosestCellInfo<MapObject> {
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

  getClosestPlayerLine(player: SharedPlayer, line: Line): ClosestLineInfo | null {
    const coord = line === Line.VERTICAL ? player.coords.x : player.coords.y;
    const closestLine = Math.floor(coord) + 0.5;
    const distance = Math.abs(coord - closestLine);

    return {
      line: closestLine,
      distance,
    };
  }

  getDesiredPlayerLine(player: SharedPlayer): Line {
    return getDirectionLine(player.direction);
  }

  getPlayerLine(player: SharedPlayer): Line {
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

  getPlayerSpeed(player: SharedPlayer): number {
    return player.buffs.some(isSuperSpeed) ? SUPER_SPEED : player.speed;
  }

  healPlayer(playerIndex: number): boolean {
    const player = this.players[playerIndex];

    if (!player.hpReserve || player.hp === MAX_HP) {
      return false;
    }

    player.hpReserve = 0;
    player.hp++;

    return true;
  }

  movePlayer(playerIndex: number, timePassed: number): MovePlayerResult {
    if (timePassed <= 0) {
      return { distanceLeft: 0, distanceWalked: 0 };
    }

    const player = this.players[playerIndex];

    const desiredLine = this.getDesiredPlayerLine(player);
    let distanceLeft = ((CELLS_PER_SECOND + this.getPlayerSpeed(player) * SPEED_INCREMENT) * timePassed) / SECOND;
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

  movePlayerDistance(player: SharedPlayer, distance: number, direction: Direction): void {
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
