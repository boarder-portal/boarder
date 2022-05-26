import { EGame } from 'common/types/game';
import { EDirection } from 'common/types/bombers';
import { ICoords } from 'common/types';

import Entity, { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';
import Bomb from 'server/gamesData/Game/BombersGame/entities/Bomb';

export interface IPlayerOptions {
  index: number;
  coords: ICoords;
}

export default class Player extends Entity<EGame.BOMBERS> {
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

  hit = this.createTrigger();

  constructor(game: BombersGame, options: IPlayerOptions) {
    super(game);

    this.index = options.index;
    this.coords = options.coords;
  }

  *makeInvincible(upToTimestamp: number): TGenerator {
    this.invincibleEndsAt = upToTimestamp;

    yield* this.delay(upToTimestamp - Date.now());

    this.invincibleEndsAt = null;
  }

  *lifecycle(): TGenerator {
    yield* this.eternity();
  }

  placeBomb(bomb: Bomb): void {
    this.placedBombs.add(bomb);
  }

  removeBomb(bomb: Bomb): void {
    this.placedBombs.delete(bomb);
  }
}
