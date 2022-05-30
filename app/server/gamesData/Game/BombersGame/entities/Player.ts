import pick from 'lodash/pick';

import { MAX_BOMB_COUNT, MAX_BOMB_RANGE, MAX_HP, MAX_SPEED } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EBonus, EDirection, EGameClientEvent, EGameServerEvent, IPlayerData } from 'common/types/bombers';
import { ICoords } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import PlayerEntity, { IPlayerOptions as ICommonPlayerOptions } from 'server/gamesData/Game/utilities/PlayerEntity';

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
  invincibleEndsAt: number | null = null;
  placedBombs = new Set<Bomb>();

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

  consumeBonus(bonus: Bonus): void {
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
  }

  getCurrentCell(): IServerCell {
    return this.game.map[Math.round(this.coords.y - 0.5)][Math.round(this.coords.x - 0.5)];
  }

  isAlive(): boolean {
    return this.hp > 0;
  }

  *listenForEvents(): TGenerator {
    yield* this.all([
      this.listenForOwnEvent(EGameClientEvent.START_MOVING, this.startMoving),
      this.listenForOwnEvent(EGameClientEvent.STOP_MOVING, this.stopMoving),
      this.listenForOwnEvent(EGameClientEvent.PLACE_BOMB, () => {
        this.game.placeBomb(this, this.getCurrentCell());
      }),
    ]);
  }

  *makeInvincible(upToTimestamp: number): TGenerator {
    this.invincibleEndsAt = upToTimestamp;

    yield* this.delay(upToTimestamp - Date.now());

    this.invincibleEndsAt = null;
  }

  placeBomb(bomb: Bomb): void {
    this.placedBombs.add(bomb);
  }

  removeBomb(bomb: Bomb): void {
    this.placedBombs.delete(bomb);
  }

  startMoving = (direction: EDirection): void => {
    this.direction = direction;
    this.startMovingTimestamp = Date.now();

    this.sendSocketEvent(EGameServerEvent.START_MOVING, {
      playerIndex: this.index,
      direction,
      startMovingTimestamp: this.startMovingTimestamp,
    });
  };

  stopMoving = (): void => {
    this.startMovingTimestamp = null;

    // TODO: move player

    this.sendSocketEvent(EGameServerEvent.STOP_MOVING, {
      playerIndex: this.index,
      coords: this.coords,
    });
  };

  toJSON(): IPlayerData {
    return pick(this, ['coords', 'direction', 'startMovingTimestamp', 'speed', 'maxBombCount', 'bombRange', 'hp']);
  }
}
