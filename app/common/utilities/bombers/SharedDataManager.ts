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

import { ICoords } from 'common/types';
import { EBonus, EBuff, EDirection, ELine, IBuff } from 'common/types/bombers';

import { isFloatZero } from 'common/utilities/float';
import getCoordsBehind from 'common/utilities/bombers/getCoordsBehind';
import getDirectionLine from 'common/utilities/bombers/getDirectionLine';
import { isSuperSpeed } from 'common/utilities/bombers/buffs';

export interface IMapObjectWithId {
  id: number;
}

export interface ISharedCell<MapObject extends IMapObjectWithId> {
  x: number;
  y: number;
  objects: MapObject[];
}

export type TSharedMap<MapObject extends IMapObjectWithId> = ISharedCell<MapObject>[][];

export interface ISharedPlayer {
  coords: ICoords;
  direction: EDirection;
  startMovingTimestamp: number | null;
  speed: number;
  speedReserve: number;
  maxBombCount: number;
  maxBombCountReserve: number;
  bombRange: number;
  bombRangeReserve: number;
  hp: number;
  hpReserve: number;
  buffs: IBuff[];
}

export interface ISharedBonus {
  type: EBonus;
}

export interface ISharedDataManagerOptions<MapObject extends IMapObjectWithId> {
  map: TSharedMap<MapObject>;
  players: ISharedPlayer[];
  isPassableObject(object: MapObject): boolean;
}

interface IClosestCellInfo<MapObject extends IMapObjectWithId> {
  cell: ISharedCell<MapObject> | undefined;
  distance: number;
}

interface IClosestLineInfo {
  line: number;
  distance: number;
}

interface IMovePlayerResult {
  distanceLeft: number;
  distanceWalked: number;
}

export default class SharedDataManager<MapObject extends IMapObjectWithId> {
  map: TSharedMap<MapObject>;
  players: ISharedPlayer[];
  isPassableObject: ISharedDataManagerOptions<MapObject>['isPassableObject'];

  constructor(options: ISharedDataManagerOptions<MapObject>) {
    this.map = options.map;
    this.players = options.players;
    this.isPassableObject = options.isPassableObject;
  }

  activatePlayerBuff(playerIndex: number, type: EBuff, endsAt: number): IBuff {
    const player = this.players[playerIndex];

    if (type === EBuff.SUPER_SPEED) {
      const amountFromReserve = Math.min(player.speedReserve, SUPER_SPEED_COST);

      player.speedReserve -= amountFromReserve;
      player.speed -= SUPER_SPEED_COST - amountFromReserve;
    } else if (type === EBuff.SUPER_BOMB) {
      const amountFromReserve = Math.min(player.maxBombCountReserve, SUPER_BOMB_COST);

      player.maxBombCountReserve -= amountFromReserve;
      player.maxBombCount -= SUPER_BOMB_COST - amountFromReserve;
    } else if (type === EBuff.SUPER_RANGE) {
      const amountFromReserve = Math.min(player.bombRangeReserve, SUPER_RANGE_COST);

      player.bombRangeReserve -= amountFromReserve;
      player.bombRange -= SUPER_RANGE_COST - amountFromReserve;
    } else if (type === EBuff.INVINCIBILITY) {
      this.deactivatePlayerBuff(playerIndex, EBuff.BOMB_INVINCIBILITY);

      const amountFromReserve = Math.min(player.hpReserve, INVINCIBILITY_COST);

      player.hpReserve -= amountFromReserve;
      player.hp -= INVINCIBILITY_COST - amountFromReserve;
    }

    const activeBuff = player.buffs.find((buff) => buff.type === type);

    if (activeBuff) {
      activeBuff.endsAt = endsAt;

      return activeBuff;
    }

    const newBuff: IBuff = {
      type,
      endsAt,
    };

    player.buffs.push(newBuff);

    return newBuff;
  }

  canPlayerPassCell(player: ISharedPlayer, cell: ISharedCell<MapObject> | undefined): boolean {
    return Boolean(cell?.objects.every((object) => player.buffs.some(isSuperSpeed) || this.isPassableObject(object)));
  }

  consumePlayerBonus(playerIndex: number, bonus: ISharedBonus): void {
    const player = this.players[playerIndex];

    if (bonus.type === EBonus.SPEED) {
      if (player.speed >= MAX_SPEED) {
        player.speedReserve++;
      } else {
        player.speed++;
      }
    } else if (bonus.type === EBonus.BOMB_COUNT) {
      if (player.maxBombCount >= MAX_BOMB_COUNT) {
        player.maxBombCountReserve++;
      } else {
        player.maxBombCount++;
      }
    } else if (bonus.type === EBonus.BOMB_RANGE) {
      if (player.bombRange >= MAX_BOMB_RANGE) {
        player.bombRangeReserve++;
      } else {
        player.bombRange++;
      }
    } else if (bonus.type === EBonus.HP) {
      if (player.hp >= MAX_HP) {
        player.hpReserve++;
      } else {
        player.hp++;
      }
    }
  }

  deactivatePlayerBuff(playerIndex: number, type: EBuff): void {
    const player = this.players[playerIndex];

    player.buffs = player.buffs.filter((buff) => buff.type !== type);
  }

  getCell(coords: ICoords): ISharedCell<MapObject> | undefined {
    if (coords.x < 0 || coords.y < 0) {
      return;
    }

    return this.map.at(coords.y)?.at(coords.x);
  }

  getClosestCell(player: ISharedPlayer, direction: EDirection): IClosestCellInfo<MapObject> {
    if (direction === EDirection.DOWN) {
      const bottom = player.coords.y + BOMBER_CELL_SIZE / 2;

      return {
        cell: this.getCell({ x: Math.floor(player.coords.x), y: Math.ceil(bottom) }),
        distance: bottom % 1 && 1 - (bottom % 1),
      };
    }

    if (direction === EDirection.UP) {
      const top = player.coords.y - BOMBER_CELL_SIZE / 2;

      return {
        cell: this.getCell({ x: Math.floor(player.coords.x), y: Math.floor(top) - 1 }),
        distance: top % 1,
      };
    }

    if (direction === EDirection.RIGHT) {
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

  getClosestOrBehindCell(player: ISharedPlayer, direction: EDirection): IClosestCellInfo<MapObject> {
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

  getClosestPlayerLine(player: ISharedPlayer, line: ELine): IClosestLineInfo | null {
    const coord = line === ELine.VERTICAL ? player.coords.x : player.coords.y;
    const closestLine = Math.floor(coord) + 0.5;
    const distance = Math.abs(coord - closestLine);

    return {
      line: closestLine,
      distance,
    };
  }

  getDesiredPlayerLine(player: ISharedPlayer): ELine {
    return getDirectionLine(player.direction);
  }

  getPlayerLine(player: ISharedPlayer): ELine {
    const isOnVertical = isFloatZero(player.coords.x % 0.5);
    const isOnHorizontal = isFloatZero(player.coords.y % 0.5);

    if ((player.direction === EDirection.UP || player.direction === EDirection.DOWN) && isOnVertical) {
      return ELine.VERTICAL;
    }

    if ((player.direction === EDirection.LEFT || player.direction === EDirection.RIGHT) && isOnHorizontal) {
      return ELine.HORIZONTAL;
    }

    return isOnVertical ? ELine.VERTICAL : ELine.HORIZONTAL;
  }

  getPlayerSpeed(player: ISharedPlayer): number {
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

  movePlayer(playerIndex: number, timePassed: number): IMovePlayerResult {
    if (timePassed <= 0) {
      return { distanceLeft: 0, distanceWalked: 0 };
    }

    const player = this.players[playerIndex];

    const desiredLine = this.getDesiredPlayerLine(player);
    let distanceLeft = ((CELLS_PER_SECOND + this.getPlayerSpeed(player) * SPEED_INCREMENT) * timePassed) / 1000;
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
          line === ELine.VERTICAL
            ? closestLine < player.coords.y
              ? EDirection.UP
              : EDirection.DOWN
            : closestLine < player.coords.x
            ? EDirection.LEFT
            : EDirection.RIGHT;
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

  movePlayerDistance(player: ISharedPlayer, distance: number, direction: EDirection): void {
    if (direction === EDirection.UP) {
      player.coords.y -= distance;
    } else if (direction === EDirection.DOWN) {
      player.coords.y += distance;
    } else if (direction === EDirection.LEFT) {
      player.coords.x -= distance;
    } else if (direction === EDirection.RIGHT) {
      player.coords.x += distance;
    }
  }

  removeMapObject(id: number, coords: ICoords): void {
    const { objects } = this.map[coords.y][coords.x];

    const wallIndex = objects.findIndex((object) => object.id === id);

    if (wallIndex !== -1) {
      objects.splice(wallIndex, 1);
    }
  }
}
