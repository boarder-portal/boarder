import { EGame } from 'common/types/game';
import { EDirection, EGameClientEvent } from 'common/types/bombers';
import { ICoords } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import PlayerEntity from 'server/gamesData/Game/utilities/PlayerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';
import Bomb from 'server/gamesData/Game/BombersGame/entities/Bomb';

export interface IPlayerOptions {
  index: number;
  coords: ICoords;
}

export default class Player extends PlayerEntity<EGame.BOMBERS> {
  index: number;

  coords: ICoords;
  direction = EDirection.DOWN;
  isMoving = false;
  speed = 1;
  maxBombCount = 1;
  bombRange = 1;
  hp = 3;
  invincibleEndsAt: number | null = null;
  placedBombs = new Set<Bomb>();

  hit = this.createTrigger<number>();

  constructor(game: BombersGame, options: IPlayerOptions) {
    super(game, options);

    this.index = options.index;
    this.coords = options.coords;
  }

  *makeInvincible(upToTimestamp: number): TGenerator {
    this.invincibleEndsAt = upToTimestamp;

    yield* this.delay(upToTimestamp - Date.now());

    this.invincibleEndsAt = null;
  }

  *lifecycle(): TGenerator {
    this.spawnTask(this.listenForEvents());

    while (true) {
      const damage = yield* this.hit;

      this.hp = Math.max(0, this.hp - damage);

      if (this.hp === 0) {
        return;
      }
    }
  }

  *listenForEvents(): TGenerator {
    yield* this.all([
      this.listenForOwnEvent(EGameClientEvent.START_MOVING, (direction) => {
        console.log('move', direction);
      }),
      this.listenForOwnEvent(EGameClientEvent.STOP_MOVING, () => {
        console.log('stop moving');
      }),
    ]);
  }

  placeBomb(bomb: Bomb): void {
    this.placedBombs.add(bomb);
  }

  removeBomb(bomb: Bomb): void {
    this.placedBombs.delete(bomb);
  }
}
