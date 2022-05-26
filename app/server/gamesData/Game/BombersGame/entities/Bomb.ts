import { EGame } from 'common/types/game';
import { EObject, IBomb } from 'common/types/bombers';
import { ICoords } from 'common/types';

import Entity, { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBombOptions {
  coords: ICoords;
}

export default class Bomb extends Entity<EGame.BOMBERS> {
  coords: ICoords;
  explodesAt = 0;

  constructor(game: BombersGame, options: IBombOptions) {
    super(game);

    this.coords = options.coords;
  }

  *lifecycle(): TGenerator {
    this.explodesAt = Date.now() + 1000;

    yield* this.delay(this.explodesAt);
  }

  toJSON(): IBomb {
    return {
      type: EObject.BOMB,
      explodesAt: this.explodesAt,
    };
  }
}
