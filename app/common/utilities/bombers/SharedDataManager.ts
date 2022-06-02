import {
  CELLS_PER_SECOND,
  MAX_BOMB_COUNT,
  MAX_BOMB_RANGE,
  MAX_HP,
  MAX_SPEED,
  SPEED_INCREMENT,
} from 'common/constants/games/bombers';

import { ICoords } from 'common/types';
import { EBonus, EDirection, ELine } from 'common/types/bombers';

import { isFloatZero } from 'common/utilities/float';
import getCoordsBehind from 'common/utilities/bombers/getCoordsBehind';
import getDirectionLine from 'common/utilities/bombers/getDirectionLine';

export interface ISharedCell<MapObject> {
  x: number;
  y: number;
  object: MapObject | null;
}

export type TSharedMap<MapObject> = ISharedCell<MapObject>[][];

export interface ISharedPlayer {
  coords: ICoords;
  direction: EDirection;
  startMovingTimestamp: number | null;
  speed: number;
  maxBombCount: number;
  bombRange: number;
  hp: number;
}

export interface ISharedBonus {
  type: EBonus;
}

export interface ISharedDataManagerOptions<MapObject> {
  map: TSharedMap<MapObject>;
  players: ISharedPlayer[];
  isPassableObject(object: MapObject | null | undefined): boolean;
}

interface IClosestCellInfo<MapObject> {
  cell: ISharedCell<MapObject> | undefined;
  distance: number;
}

interface IClosestLineInfo {
  line: number;
  distance: number;
}

export default class SharedDataManager<MapObject> {
  map: TSharedMap<MapObject>;
  players: ISharedPlayer[];
  isPassableObject: ISharedDataManagerOptions<MapObject>['isPassableObject'];

  constructor(options: ISharedDataManagerOptions<MapObject>) {
    this.map = options.map;
    this.players = options.players;
    this.isPassableObject = options.isPassableObject;
  }

  consumePlayerBonus(playerIndex: number, bonus: ISharedBonus): void {
    const player = this.players[playerIndex];

    if (bonus.type === EBonus.SPEED) {
      player.speed = Math.min(MAX_SPEED, player.speed + 1);
    } else if (bonus.type === EBonus.BOMB_COUNT) {
      player.maxBombCount = Math.min(MAX_BOMB_COUNT, player.maxBombCount + 1);
    } else if (bonus.type === EBonus.BOMB_RANGE) {
      player.bombRange = Math.min(MAX_BOMB_RANGE, player.bombRange + 1);
    } else if (bonus.type === EBonus.HP) {
      player.hp = Math.min(MAX_HP, player.hp + 1);
    }
  }

  getCell(coords: ICoords): ISharedCell<MapObject> | undefined {
    if (coords.x < 0 || coords.y < 0) {
      return;
    }

    return this.map.at(coords.y)?.at(coords.x);
  }

  getClosestCell(player: ISharedPlayer, direction: EDirection): IClosestCellInfo<MapObject> {
    if (direction === EDirection.DOWN) {
      const bottom = player.coords.y + 0.5;

      return {
        cell: this.getCell({ x: Math.floor(player.coords.x), y: Math.ceil(bottom) }),
        distance: bottom % 1 && 1 - (bottom % 1),
      };
    }

    if (direction === EDirection.UP) {
      const top = player.coords.y - 0.5;

      return {
        cell: this.getCell({ x: Math.floor(player.coords.x), y: Math.floor(top) - 1 }),
        distance: top % 1,
      };
    }

    if (direction === EDirection.RIGHT) {
      const right = player.coords.x + 0.5;

      return {
        cell: this.getCell({ x: Math.ceil(right), y: Math.floor(player.coords.y) }),
        distance: right % 1 && 1 - (right % 1),
      };
    }

    const left = player.coords.x - 0.5;

    return {
      cell: this.getCell({ x: Math.floor(left) - 1, y: Math.floor(player.coords.y) }),
      distance: left % 1,
    };
  }

  getClosestOrBehindCell(player: ISharedPlayer, direction: EDirection): IClosestCellInfo<MapObject> {
    const closestCellInfo = this.getClosestCell(player, direction);
    const canPass = this.isPassableObject(closestCellInfo.cell?.object);

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

  movePlayer(playerIndex: number, timePassed: number): void {
    if (timePassed <= 0) {
      return;
    }

    const player = this.players[playerIndex];

    const desiredLine = this.getDesiredPlayerLine(player);
    let distanceLeft = ((CELLS_PER_SECOND + player.speed * SPEED_INCREMENT) * timePassed) / 1000;
    let movingDirection = player.direction;

    while (!isFloatZero(distanceLeft)) {
      const line = this.getPlayerLine(player);
      const { cell: closestCell, distance: distanceToClosestCell } =
        line === desiredLine
          ? this.getClosestOrBehindCell(player, player.direction)
          : this.getClosestCell(player, player.direction);
      const canPass = this.isPassableObject(closestCell?.object);
      let distanceToPass: number;

      if (line === desiredLine) {
        movingDirection = player.direction;
        distanceToPass = distanceToClosestCell;

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

      distanceLeft = Math.max(0, distanceLeft - distanceToPass);

      this.movePlayerDistance(player, distancePassed, movingDirection);

      if (isFloatZero(distancePassed)) {
        console.error('something went wrong');

        break;
      }
    }
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
}
