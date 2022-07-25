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

import { EGame } from 'common/types/game';
import {
  EBuff,
  EDirection,
  EGameClientEvent,
  EGameServerEvent,
  EPlayerColor,
  IBuff,
  IPlayerData,
} from 'common/types/bombers';
import { ICoords } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import PlayerEntity, { IPlayerOptions as ICommonPlayerOptions } from 'server/gamesData/Game/utilities/PlayerEntity';
import { now } from 'server/utilities/time';
import isNotUndefined from 'common/utilities/isNotUndefined';
import { isFloatZero } from 'common/utilities/float';
import { isInvincibility, isSuperSpeed } from 'common/utilities/bombers/buffs';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';
import Bomb from 'server/gamesData/Game/BombersGame/entities/Bomb';
import Bonus from 'server/gamesData/Game/BombersGame/entities/Bonus';

export interface IPlayerOptions extends ICommonPlayerOptions {
  color: EPlayerColor;
  coords: ICoords;
}

export default class Player extends PlayerEntity<EGame.BOMBERS> {
  game: BombersGame;

  color: EPlayerColor;
  coords: ICoords;
  direction = EDirection.DOWN;
  isDisabled = false;
  startMovingTimestamp: number | null = null;
  speed = 1;
  speedReserve = 0;
  maxBombCount = 1;
  maxBombCountReserve = 0;
  bombRange = 1;
  bombRangeReserve = 0;
  hp = MAX_HP;
  hpReserve = 0;
  buffs: IBuff[] = [];
  placedBombs = new Set<Bomb>();

  disable = this.createTrigger();
  grantControls = this.createTrigger();
  cancelBuffTimeout = this.createTrigger<EBuff>();
  hit = this.createTrigger<number>();

  constructor(game: BombersGame, options: IPlayerOptions) {
    super(game, options);

    this.game = game;
    this.color = options.color;
    this.coords = options.coords;
  }

  *lifecycle(): TGenerator {
    this.spawnTask(this.waitForControls());
    this.spawnTask(this.waitForDisable());

    while (true) {
      const damage = yield* this.hit;

      this.hp = Math.max(0, this.hp - damage);

      if (!this.isAlive()) {
        break;
      }

      this.spawnTask(this.activateBuff(EBuff.BOMB_INVINCIBILITY));
    }

    this.sendSocketEvent(EGameServerEvent.PLAYER_DIED, this.index);

    this.disable();
  }

  *activateBuff(type: EBuff): TGenerator {
    const endsAt = now() + BUFF_DURATIONS[type];
    const buff = this.game.sharedDataManager.activatePlayerBuff(this.index, type, endsAt);

    this.cancelBuffTimeout(type);

    this.sendSocketEvent(EGameServerEvent.BUFF_ACTIVATED, {
      playerIndex: this.index,
      buff,
    });

    const { type: raceEventType } = yield* this.race({
      timeout: this.delay(endsAt - now()),
      cancelTimeout: this.waitForBuffCancel(type),
    });

    if (raceEventType === 'cancelTimeout') {
      return;
    }

    this.game.sharedDataManager.deactivatePlayerBuff(this.index, type);

    this.sendSocketEvent(EGameServerEvent.BUFF_DEACTIVATED, {
      playerIndex: this.index,
      type,
    });
  }

  canPlaceBombs(): boolean {
    return this.placedBombs.size < this.maxBombCount;
  }

  consumeBonus(bonus: Bonus, coords: ICoords): void {
    bonus.consume();

    this.game.sharedDataManager.consumePlayerBonus(this.index, bonus);

    this.sendSocketEvent(EGameServerEvent.BONUS_CONSUMED, {
      id: bonus.id,
      playerIndex: this.index,
      coords,
    });
  }

  getCurrentCell(): IServerCell {
    const cell = this.game.getCell({
      x: Math.floor(this.coords.x),
      y: Math.floor(this.coords.y),
    });

    if (!cell) {
      throw new Error('No player cell');
    }

    return cell;
  }

  getOccupiedCells(): IServerCell[] {
    const bomberCell = this.getCurrentCell();
    const occupiedCells: (IServerCell | undefined)[] = [bomberCell];

    if (this.coords.x + BOMBER_CELL_SIZE / 2 > bomberCell.x + 1) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, EDirection.RIGHT));
    }

    if (this.coords.x - BOMBER_CELL_SIZE / 2 < bomberCell.x) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, EDirection.LEFT));
    }

    if (this.coords.y + BOMBER_CELL_SIZE / 2 > bomberCell.y + 1) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, EDirection.DOWN));
    }

    if (this.coords.y - BOMBER_CELL_SIZE / 2 < bomberCell.y) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, EDirection.UP));
    }

    return occupiedCells.filter(isNotUndefined);
  }

  heal = (): void => {
    if (this.game.sharedDataManager.healPlayer(this.index)) {
      this.sendSocketEvent(EGameServerEvent.PLAYER_HEALED, this.index);
    }
  };

  isAlive(): boolean {
    return this.hp > 0;
  }

  kill(): void {
    this.hit(Infinity);
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
        this.listenForOwnEvent(EGameClientEvent.HEAL, this.heal),
        this.listenForOwnEvent(EGameClientEvent.ACTIVATE_BUFF, this.tryToActivateBuff),
      ]),
    ]);
  }

  move(): void {
    if (this.isDisabled || !this.isAlive()) {
      return;
    }

    if (this.startMovingTimestamp) {
      const newMoveTimestamp = now();
      const timePassed = newMoveTimestamp - this.startMovingTimestamp;

      const { distanceLeft, distanceWalked } = this.game.sharedDataManager.movePlayer(this.index, timePassed);

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

  startMoving = (direction: EDirection): void => {
    this.direction = direction;
    this.startMovingTimestamp = now();

    this.syncCoords();
  };

  stopMoving = (): void => {
    this.move();

    this.startMovingTimestamp = null;

    this.syncCoords();
  };

  syncCoords(): void {
    this.sendSocketEvent(EGameServerEvent.SYNC_COORDS, {
      playerIndex: this.index,
      direction: this.direction,
      startMovingTimestamp: this.startMovingTimestamp,
      coords: this.coords,
    });
  }

  toJSON(): IPlayerData {
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

  tryToActivateBuff = (type: EBuff): void => {
    if (!this.game.options.withAbilities) {
      return;
    }

    if (
      (type === EBuff.SUPER_SPEED && this.speed + this.speedReserve <= SUPER_SPEED_COST) ||
      (type === EBuff.SUPER_BOMB && this.maxBombCount + this.maxBombCountReserve <= SUPER_BOMB_COST) ||
      (type === EBuff.SUPER_RANGE && this.bombRange + this.bombRangeReserve <= SUPER_RANGE_COST) ||
      (type === EBuff.INVINCIBILITY && this.hp + this.hpReserve <= INVINCIBILITY_COST) ||
      type === EBuff.BOMB_INVINCIBILITY
    ) {
      return;
    }

    this.spawnTask(this.activateBuff(type));
  };

  *waitForBuffCancel(type: EBuff): TGenerator<true> {
    while (true) {
      const buffType = yield* this.cancelBuffTimeout;

      if (buffType === type) {
        return true;
      }
    }
  }

  *waitForControls(): TGenerator {
    yield* this.grantControls;
    yield* this.listenForEvents();
  }

  *waitForDisable(): TGenerator {
    yield* this.disable;

    this.isDisabled = true;

    this.stopMoving();
  }
}
