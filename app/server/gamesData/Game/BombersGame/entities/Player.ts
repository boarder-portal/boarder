import pick from 'lodash/pick';

import {
  BOMBER_CELL_SIZE,
  CELLS_PER_SECOND,
  MAX_BOMB_COUNT,
  MAX_BOMB_RANGE,
  MAX_HP,
  MAX_SPEED,
} from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EBonus, EDirection, EGameClientEvent, EGameServerEvent, IPlayerData } from 'common/types/bombers';
import { ICoords } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import PlayerEntity, { IPlayerOptions as ICommonPlayerOptions } from 'server/gamesData/Game/utilities/PlayerEntity';
import { now } from 'server/utilities/time';
import { isFloatZero } from 'common/utilities/float';
import isNotUndefined from 'common/utilities/isNotUndefined';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';
import Bomb from 'server/gamesData/Game/BombersGame/entities/Bomb';
import Bonus from 'server/gamesData/Game/BombersGame/entities/Bonus';

export interface IPlayerOptions extends ICommonPlayerOptions {
  coords: ICoords;
}

enum ELine {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}

interface IClosestCellInfo {
  cell: IServerCell | undefined;
  distance: number;
}

interface IClosestLineInfo {
  line: number;
  distance: number;
}

export default class Player extends PlayerEntity<EGame.BOMBERS> {
  game: BombersGame;

  coords: ICoords;
  direction = EDirection.DOWN;
  startMovingTimestamp: number | null = null;
  speed = 1;
  maxBombCount = 1;
  bombRange = 1;
  hp = MAX_HP;
  invincibleEndsAt: number | null = null;
  placedBombs = new Set<Bomb>();

  disable = this.createTrigger();
  hit = this.createTrigger<number>();

  constructor(game: BombersGame, options: IPlayerOptions) {
    super(game, options);

    this.game = game;
    this.coords = options.coords;
  }

  *lifecycle(): TGenerator {
    this.spawnTask(this.listenForEvents());

    while (true) {
      const damage = yield* this.hit;

      this.hp = Math.max(0, this.hp - damage);

      if (!this.isAlive()) {
        return;
      }
    }
  }

  canPlaceBombs(): boolean {
    return this.placedBombs.size < this.maxBombCount;
  }

  consumeBonus(bonus: Bonus, coords: ICoords): void {
    bonus.consume();

    if (bonus.type === EBonus.SPEED) {
      this.speed = Math.min(MAX_SPEED, this.speed + 1);
    } else if (bonus.type === EBonus.BOMB_COUNT) {
      this.maxBombCount = Math.min(MAX_BOMB_COUNT, this.maxBombCount + 1);
    } else if (bonus.type === EBonus.BOMB_RANGE) {
      this.bombRange = Math.min(MAX_BOMB_RANGE, this.bombRange + 1);
    } else if (bonus.type === EBonus.HP) {
      this.hp = Math.min(MAX_HP, this.hp + 1);
    }

    this.sendSocketEvent(EGameServerEvent.BONUS_CONSUMED, {
      playedIndex: this.index,
      coords,
    });
  }

  getClosestOrBehindCell(direction: EDirection): IClosestCellInfo {
    const closestCellInfo = this.getClosestCell(direction);
    const canPass = Boolean(closestCellInfo.cell && this.game.isPassableObject(closestCellInfo.cell.object));

    if (!canPass || !isFloatZero(closestCellInfo.distance)) {
      return closestCellInfo;
    }

    let coordsBehind: ICoords | undefined;

    if (closestCellInfo.cell) {
      if (direction === EDirection.UP) {
        coordsBehind = {
          x: closestCellInfo.cell.x,
          y: closestCellInfo.cell.y - 1,
        };
      } else if (direction === EDirection.DOWN) {
        coordsBehind = {
          x: closestCellInfo.cell.x,
          y: closestCellInfo.cell.y + 1,
        };
      } else if (direction === EDirection.LEFT) {
        coordsBehind = {
          x: closestCellInfo.cell.x - 1,
          y: closestCellInfo.cell.y,
        };
      } else if (direction === EDirection.RIGHT) {
        coordsBehind = {
          x: closestCellInfo.cell.x + 1,
          y: closestCellInfo.cell.y,
        };
      }
    }

    return {
      cell: coordsBehind && this.game.getCell(coordsBehind),
      distance: closestCellInfo.distance + 1,
    };
  }

  getClosestCell(direction: EDirection): IClosestCellInfo {
    if (direction === EDirection.DOWN) {
      const bottom = this.coords.y + BOMBER_CELL_SIZE / 2;

      return {
        cell: this.game.getCell({ x: Math.floor(this.coords.x), y: Math.ceil(bottom) }),
        distance: 1 - (bottom % 1),
      };
    }

    if (direction === EDirection.UP) {
      const top = this.coords.y - BOMBER_CELL_SIZE / 2;

      return {
        cell: this.game.getCell({ x: Math.floor(this.coords.x), y: Math.floor(top) - 1 }),
        distance: top % 1,
      };
    }

    if (direction === EDirection.RIGHT) {
      const right = this.coords.x + BOMBER_CELL_SIZE / 2;

      return {
        cell: this.game.getCell({ x: Math.ceil(right), y: Math.floor(this.coords.y) }),
        distance: 1 - (right % 1),
      };
    }

    const left = this.coords.x - BOMBER_CELL_SIZE / 2;

    return {
      cell: this.game.getCell({ x: Math.floor(left) - 1, y: Math.floor(this.coords.y) }),
      distance: left % 1,
    };
  }

  getClosestLine(line: ELine): IClosestLineInfo | null {
    const coord = line === ELine.VERTICAL ? this.coords.x : this.coords.y;
    const closestLine = Math.floor(coord) + 0.5;
    const distance = Math.abs(coord - closestLine);

    if (Math.abs(coord - closestLine) > 1 - BOMBER_CELL_SIZE) {
      return null;
    }

    return {
      line: closestLine,
      distance,
    };
  }

  getCurrentCell(): IServerCell {
    const cell = this.game.getCell({
      x: Math.round(this.coords.x - 0.5),
      y: Math.round(this.coords.y - 0.5),
    });

    if (!cell) {
      throw new Error('No player cell');
    }

    return cell;
  }

  getDesiredLine(): ELine {
    return this.direction === EDirection.UP || this.direction === EDirection.DOWN ? ELine.VERTICAL : ELine.HORIZONTAL;
  }

  getLine(): ELine {
    const isOnVertical = isFloatZero(this.coords.x % 0.5);
    const isOnHorizontal = isFloatZero(this.coords.y % 0.5);

    if ((this.direction === EDirection.UP || this.direction === EDirection.DOWN) && isOnVertical) {
      return ELine.VERTICAL;
    }

    if ((this.direction === EDirection.LEFT || this.direction === EDirection.RIGHT) && isOnHorizontal) {
      return ELine.HORIZONTAL;
    }

    return isOnVertical ? ELine.VERTICAL : ELine.HORIZONTAL;
  }

  getOccupiedCells(): IServerCell[] {
    const bomberCell = this.getCurrentCell();
    const occupiedCells: (IServerCell | undefined)[] = [bomberCell];

    if (this.coords.x + BOMBER_CELL_SIZE / 2 > bomberCell.x + 1) {
      occupiedCells.push(this.game.getCell({ x: bomberCell.x + 1, y: bomberCell.y }));
    }

    if (this.coords.x - BOMBER_CELL_SIZE / 2 < bomberCell.x) {
      occupiedCells.push(this.game.getCell({ x: bomberCell.x - 1, y: bomberCell.y }));
    }

    if (this.coords.y + BOMBER_CELL_SIZE / 2 > bomberCell.y + 1) {
      occupiedCells.push(this.game.getCell({ x: bomberCell.x, y: bomberCell.y + 1 }));
    }

    if (this.coords.y + BOMBER_CELL_SIZE / 2 < bomberCell.y) {
      occupiedCells.push(this.game.getCell({ x: bomberCell.x, y: bomberCell.y - 1 }));
    }

    return occupiedCells.filter(isNotUndefined);
  }

  isAlive(): boolean {
    return this.hp > 0;
  }

  *listenForEvents(): TGenerator {
    yield* this.race([
      this.disable,
      this.all([
        this.listenForOwnEvent(EGameClientEvent.START_MOVING, this.startMoving),
        this.listenForOwnEvent(EGameClientEvent.STOP_MOVING, this.stopMoving),
        this.listenForOwnEvent(EGameClientEvent.PLACE_BOMB, () => {
          this.game.placeBomb(this, this.getCurrentCell());
        }),
      ]),
    ]);
  }

  *makeInvincible(upToTimestamp: number): TGenerator {
    this.invincibleEndsAt = upToTimestamp;

    yield* this.delay(upToTimestamp - now());

    this.invincibleEndsAt = null;
  }

  move(): void {
    if (!this.startMovingTimestamp || !this.isAlive()) {
      return;
    }

    const newMoveTimestamp = now();
    const timePassed = newMoveTimestamp - this.startMovingTimestamp;
    const desiredLine = this.getDesiredLine();
    let distanceLeft = (this.speed * CELLS_PER_SECOND * timePassed) / 1000;
    let movingDirection = this.direction;

    while (!isFloatZero(distanceLeft)) {
      const line = this.getLine();
      const { cell: closestCell, distance: distanceToClosestCell } =
        line === desiredLine ? this.getClosestOrBehindCell(this.direction) : this.getClosestCell(this.direction);
      const canPass = Boolean(closestCell && this.game.isPassableObject(closestCell.object));
      let distanceToPass: number;

      if (line === desiredLine) {
        movingDirection = this.direction;

        if (canPass) {
          distanceToPass = distanceToClosestCell;
        } else {
          distanceToPass = distanceToClosestCell - (1 - BOMBER_CELL_SIZE) / 2;

          // in front of the object or map edge
          if (isFloatZero(distanceToPass)) {
            break;
          }
        }
      } else {
        if (!canPass) {
          break;
        }

        const closestLineInfo = this.getClosestLine(desiredLine);

        if (!closestLineInfo) {
          break;
        }

        const { line: closestLine, distance } = closestLineInfo;

        distanceToPass = distance;
        movingDirection =
          line === ELine.VERTICAL
            ? closestLine < this.coords.y
              ? EDirection.UP
              : EDirection.DOWN
            : closestLine < this.coords.x
            ? EDirection.LEFT
            : EDirection.RIGHT;
      }

      const distancePassed = Math.min(distanceLeft, distanceToPass);

      distanceLeft = Math.max(0, distanceLeft - distanceToPass);

      this.moveDistance(distancePassed, movingDirection);

      if (isFloatZero(distancePassed)) {
        console.error('something went wrong');

        break;
      }
    }

    this.getOccupiedCells().forEach((cell) => {
      if (cell.object instanceof Bonus) {
        this.consumeBonus(cell.object, {
          x: cell.x,
          y: cell.y,
        });
      }
    });

    this.startMovingTimestamp = newMoveTimestamp;
  }

  moveDistance(distance: number, direction: EDirection = this.direction): void {
    if (direction === EDirection.UP) {
      this.coords.y -= distance;
    } else if (direction === EDirection.DOWN) {
      this.coords.y += distance;
    } else if (direction === EDirection.LEFT) {
      this.coords.x -= distance;
    } else if (direction === EDirection.RIGHT) {
      this.coords.x += distance;
    }
  }

  placeBomb(bomb: Bomb): void {
    this.placedBombs.add(bomb);
  }

  removeBomb(bomb: Bomb): void {
    this.placedBombs.delete(bomb);
  }

  startMoving = (direction: EDirection): void => {
    this.direction = direction;
    this.startMovingTimestamp = now();

    this.sendSocketEvent(EGameServerEvent.START_MOVING, {
      playerIndex: this.index,
      direction,
      startMovingTimestamp: this.startMovingTimestamp,
    });
  };

  stopMoving = (): void => {
    this.move();

    this.startMovingTimestamp = null;

    this.sendSocketEvent(EGameServerEvent.STOP_MOVING, {
      playerIndex: this.index,
      coords: this.coords,
    });
  };

  toJSON(): IPlayerData {
    return pick(this, ['coords', 'direction', 'startMovingTimestamp', 'speed', 'maxBombCount', 'bombRange', 'hp']);
  }
}
