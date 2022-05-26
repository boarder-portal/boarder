import { EGame } from 'common/types/game';
import { EBonus, EObject, IBonus } from 'common/types/bombers';
import { ICoords } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBonusOptions {
  type: EBonus;
  coords: ICoords;
}

export default class Bonus extends ServerEntity<EGame.BOMBERS> {
  type: EBonus;
  coords: ICoords;

  constructor(game: BombersGame, options: IBonusOptions) {
    super(game);

    this.type = options.type;
    this.coords = options.coords;
  }

  *lifecycle(): TGenerator {
    yield* this.eternity();
  }

  toJSON(): IBonus {
    return {
      type: EObject.BONUS,
      bonusType: this.type,
    };
  }
}
