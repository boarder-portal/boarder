import pick from 'lodash/pick';

import { BOMBER_CELL_SIZE, MAX_HP } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EDirection, EGameClientEvent, EGameServerEvent, IPlayerData } from 'common/types/bombers';
import { ICoords } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import PlayerEntity, { IPlayerOptions as ICommonPlayerOptions } from 'server/gamesData/Game/utilities/PlayerEntity';
import { now } from 'server/utilities/time';
import isNotUndefined from 'common/utilities/isNotUndefined';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';
import Bomb from 'server/gamesData/Game/BombersGame/entities/Bomb';
import Bonus from 'server/gamesData/Game/BombersGame/entities/Bonus';

export interface IPlayerOptions extends ICommonPlayerOptions {
  coords: ICoords;
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
  invincibilityEndsAt: number | null = null;
  placedBombs = new Set<Bomb>();

  disable = this.createTrigger();
  hit = this.createTrigger<{ damage: number; invincibilityEndsAt: number | null }>();

  constructor(game: BombersGame, options: IPlayerOptions) {
    super(game, options);

    this.game = game;
    this.coords = options.coords;
  }

  *lifecycle(): TGenerator {
    this.spawnTask(this.listenForEvents());

    while (true) {
      const { damage, invincibilityEndsAt } = yield* this.hit;

      this.hp = Math.max(0, this.hp - damage);

      if (!this.isAlive()) {
        break;
      }

      if (invincibilityEndsAt) {
        this.spawnTask(this.makeInvincible(invincibilityEndsAt));
      }

      yield* this.delay(0);
    }

    this.startMovingTimestamp = null;
    this.invincibilityEndsAt = null;
  }

  canPlaceBombs(): boolean {
    return this.placedBombs.size < this.maxBombCount;
  }

  consumeBonus(bonus: Bonus, coords: ICoords): void {
    bonus.consume();

    this.game.sharedDataManager.consumePlayerBonus(this.index, bonus);

    this.sendSocketEvent(EGameServerEvent.BONUS_CONSUMED, {
      playerIndex: this.index,
      coords,
    });
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
    this.invincibilityEndsAt = upToTimestamp;

    yield* this.delay(upToTimestamp - now());

    this.invincibilityEndsAt = null;
  }

  move(): void {
    if (!this.startMovingTimestamp || !this.isAlive()) {
      return;
    }

    const newMoveTimestamp = now();
    const timePassed = newMoveTimestamp - this.startMovingTimestamp;

    this.game.sharedDataManager.movePlayer(this.index, timePassed);

    this.getOccupiedCells().forEach((cell) => {
      if (cell.object instanceof Bonus) {
        this.consumeBonus(cell.object, this.game.getCellCoords(cell));
      }
    });

    this.startMovingTimestamp = newMoveTimestamp;
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
      coords: this.coords,
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
    return pick(this, [
      'coords',
      'direction',
      'startMovingTimestamp',
      'speed',
      'maxBombCount',
      'bombRange',
      'hp',
      'invincibilityEndsAt',
    ]);
  }
}
