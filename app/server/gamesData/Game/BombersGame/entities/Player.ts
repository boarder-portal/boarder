import pick from 'lodash/pick';

import {
  BOMBER_CELL_SIZE,
  BUFF_DURATIONS,
  INVINCIBILITY_COST,
  MAX_HP,
  SUPER_BOMB_COST,
  SUPER_RANGE_COST,
  SUPER_SPEED_COST,
} from 'common/constants/games/bombers';

import { Coords, Timestamp as TimestampModel } from 'common/types';
import { GameType } from 'common/types/game';
import {
  Buff,
  BuffType,
  Direction,
  GameClientEventType,
  GameServerEventType,
  PlayerColor,
  PlayerData,
} from 'common/types/games/bombers';

import Timestamp from 'common/utilities/Timestamp';
import { isInvincibility, isSuperSpeed } from 'common/utilities/bombers/buffs';
import { isFloatZero } from 'common/utilities/float';
import isNotUndefined from 'common/utilities/isNotUndefined';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import PlayerEntity, { PlayerOptions as ICommonPlayerOptions } from 'server/gamesData/Game/utilities/PlayerEntity';

import BombersGame, { ServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';
import Bomb from 'server/gamesData/Game/BombersGame/entities/Bomb';
import Bonus from 'server/gamesData/Game/BombersGame/entities/Bonus';

export interface PlayerOptions extends ICommonPlayerOptions {
  color: PlayerColor;
  coords: Coords;
}

export default class Player extends PlayerEntity<GameType.BOMBERS> {
  game: BombersGame;

  color: PlayerColor;
  coords: Coords;
  direction = Direction.DOWN;
  isDisabled = false;
  startMovingTimestamp: Timestamp | null = null;
  speed = 1;
  speedReserve = 0;
  maxBombCount = 1;
  maxBombCountReserve = 0;
  bombRange = 1;
  bombRangeReserve = 0;
  hp = MAX_HP;
  hpReserve = 0;
  buffs: Buff[] = [];
  placedBombs = new Set<Bomb>();

  disable = this.createTrigger();
  grantControls = this.createTrigger();
  cancelBuffTimeout = this.createTrigger<BuffType>();
  hit = this.createTrigger<number>();

  constructor(game: BombersGame, options: PlayerOptions) {
    super(game, options);

    this.game = game;
    this.color = options.color;
    this.coords = options.coords;
  }

  *lifecycle(): EntityGenerator {
    this.spawnTask(this.waitForControls());
    this.spawnTask(this.waitForDisable());

    while (true) {
      const damage = yield* this.hit;

      this.hp = Math.max(0, this.hp - damage);

      if (!this.isAlive()) {
        break;
      }

      this.spawnTask(this.activateBuff(BuffType.BOMB_INVINCIBILITY));
    }

    this.sendSocketEvent(GameServerEventType.PLAYER_DIED, this.index);

    this.disable();
  }

  *activateBuff(type: BuffType): EntityGenerator {
    const endsAt = this.createTimestamp(BUFF_DURATIONS[type]);
    const buff = this.game.sharedDataManager.activatePlayerBuff(this.index, type, endsAt);

    this.cancelBuffTimeout(type);

    this.sendSocketEvent(GameServerEventType.BUFF_ACTIVATED, {
      playerIndex: this.index,
      buff,
    });

    const { type: raceEventType } = yield* this.race({
      timeout: this.waitForTimestamp(endsAt),
      cancelTimeout: this.waitForBuffCancel(type),
    });

    if (raceEventType === 'cancelTimeout') {
      return;
    }

    this.game.sharedDataManager.deactivatePlayerBuff(this.index, type);

    this.sendSocketEvent(GameServerEventType.BUFF_DEACTIVATED, {
      playerIndex: this.index,
      type,
    });
  }

  afterPause(): void {
    this.stopMoving();
  }

  canPlaceBombs(): boolean {
    return this.placedBombs.size < this.maxBombCount;
  }

  consumeBonus(bonus: Bonus, coords: Coords): void {
    bonus.consume();

    this.game.sharedDataManager.consumePlayerBonus(this.index, bonus);

    this.sendSocketEvent(GameServerEventType.BONUS_CONSUMED, {
      id: bonus.id,
      playerIndex: this.index,
      coords,
    });
  }

  getCurrentCell(): ServerCell {
    const cell = this.game.getCell({
      x: Math.floor(this.coords.x),
      y: Math.floor(this.coords.y),
    });

    if (!cell) {
      throw new Error('No player cell');
    }

    return cell;
  }

  getCurrentTimestamps(): (TimestampModel | null | undefined)[] {
    return [this.startMovingTimestamp, ...this.buffs.map(({ endsAt }) => endsAt)];
  }

  getOccupiedCells(): ServerCell[] {
    const bomberCell = this.getCurrentCell();
    const occupiedCells: (ServerCell | undefined)[] = [bomberCell];

    if (this.coords.x + BOMBER_CELL_SIZE / 2 > bomberCell.x + 1) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, Direction.RIGHT));
    }

    if (this.coords.x - BOMBER_CELL_SIZE / 2 < bomberCell.x) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, Direction.LEFT));
    }

    if (this.coords.y + BOMBER_CELL_SIZE / 2 > bomberCell.y + 1) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, Direction.DOWN));
    }

    if (this.coords.y - BOMBER_CELL_SIZE / 2 < bomberCell.y) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, Direction.UP));
    }

    return occupiedCells.filter(isNotUndefined);
  }

  heal = (): void => {
    if (this.game.sharedDataManager.healPlayer(this.index)) {
      this.sendSocketEvent(GameServerEventType.PLAYER_HEALED, this.index);
    }
  };

  isAlive(): boolean {
    return this.hp > 0;
  }

  kill(): void {
    this.hit(Infinity);
  }

  *listenForEvents(): EntityGenerator {
    yield* this.race([
      this.disable,
      this.all([
        this.listenForOwnEvent(GameClientEventType.START_MOVING, this.startMoving),
        this.listenForOwnEvent(GameClientEventType.STOP_MOVING, this.stopMoving),
        this.listenForOwnEvent(GameClientEventType.PLACE_BOMB, () => {
          this.game.placeBomb(this, this.getCurrentCell());
        }),
        this.listenForOwnEvent(GameClientEventType.HEAL, this.heal),
        this.listenForOwnEvent(GameClientEventType.ACTIVATE_BUFF, this.tryToActivateBuff),
      ]),
    ]);
  }

  move(): void {
    if (this.isDisabled || !this.isAlive()) {
      return;
    }

    if (this.startMovingTimestamp) {
      const newMoveTimestamp = this.createTimestamp();

      const { distanceLeft, distanceWalked } = this.game.sharedDataManager.movePlayer(
        this.index,
        this.startMovingTimestamp.timePassed,
      );

      // got stuck just now
      if (!isFloatZero(distanceLeft) && !isFloatZero(distanceWalked)) {
        this.syncCoords();
      }

      this.getOccupiedCells().forEach((cell) => {
        cell.objects.filter(BombersGame.isBonus).forEach((bonus) => {
          this.consumeBonus(bonus, this.game.getCellCoords(cell));
        });
      });

      this.startMovingTimestamp = newMoveTimestamp;
    }

    if (
      this.getOccupiedCells().some(({ objects }) => objects.some(BombersGame.isWall)) &&
      this.buffs.every((buff) => !isSuperSpeed(buff) && !isInvincibility(buff))
    ) {
      this.kill();

      return;
    }
  }

  placeBomb(bomb: Bomb): void {
    this.placedBombs.add(bomb);
  }

  removeBomb(bomb: Bomb): void {
    this.placedBombs.delete(bomb);
  }

  startMoving = (direction: Direction): void => {
    this.direction = direction;
    this.startMovingTimestamp = this.createTimestamp();

    this.syncCoords();
  };

  stopMoving = (): void => {
    this.move();

    this.startMovingTimestamp = null;

    this.syncCoords();
  };

  syncCoords(): void {
    this.sendSocketEvent(GameServerEventType.SYNC_COORDS, {
      playerIndex: this.index,
      direction: this.direction,
      startMovingTimestamp: this.startMovingTimestamp,
      coords: this.coords,
    });
  }

  toJSON(): PlayerData {
    return pick(this, [
      'color',
      'coords',
      'direction',
      'startMovingTimestamp',
      'speed',
      'speedReserve',
      'maxBombCount',
      'maxBombCountReserve',
      'bombRange',
      'bombRangeReserve',
      'hp',
      'hpReserve',
      'buffs',
    ]);
  }

  tryToActivateBuff = (type: BuffType): void => {
    if (!this.game.options.withAbilities) {
      return;
    }

    if (
      (type === BuffType.SUPER_SPEED && this.speed + this.speedReserve <= SUPER_SPEED_COST) ||
      (type === BuffType.SUPER_BOMB && this.maxBombCount + this.maxBombCountReserve <= SUPER_BOMB_COST) ||
      (type === BuffType.SUPER_RANGE && this.bombRange + this.bombRangeReserve <= SUPER_RANGE_COST) ||
      (type === BuffType.INVINCIBILITY && this.hp + this.hpReserve <= INVINCIBILITY_COST) ||
      type === BuffType.BOMB_INVINCIBILITY
    ) {
      return;
    }

    this.spawnTask(this.activateBuff(type));
  };

  *waitForBuffCancel(type: BuffType): EntityGenerator<true> {
    while (true) {
      const buffType = yield* this.cancelBuffTimeout;

      if (buffType === type) {
        return true;
      }
    }
  }

  *waitForControls(): EntityGenerator {
    yield* this.grantControls;
    yield* this.listenForEvents();
  }

  *waitForDisable(): EntityGenerator {
    yield* this.disable;

    this.isDisabled = true;

    this.stopMoving();
  }
}
