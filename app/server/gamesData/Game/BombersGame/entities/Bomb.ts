import { EGame } from 'common/types/game';
import { EObject, IBomb } from 'common/types/bombers';
import { ICoords } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBombOptions {
  coords: ICoords;
}

export default class Bomb extends ServerEntity<EGame.BOMBERS> {
  coords: ICoords;
  explodesAt = 0;

  constructor(game: BombersGame, options: IBombOptions) {
    super(game);

    this.coords = options.coords;
  }

  *lifecycle(): TGenerator {
    this.explodesAt = Date.now() + 1000;

    yield* this.delay(this.explodesAt - Date.now());
  }

  toJSON(): IBomb {
    return {
      type: EObject.BOMB,
      explodesAt: this.explodesAt,
    };
  }
}
