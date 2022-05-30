import { EGame } from 'common/types/game';
import { EBonus, EObject, IBonus } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBonusOptions {
  type: EBonus;
}

export default class Bonus extends ServerEntity<EGame.BOMBERS> {
  type: EBonus;

  consume = this.createTrigger();

  constructor(game: BombersGame, options: IBonusOptions) {
    super(game);

    this.type = options.type;
  }

  *lifecycle(): TGenerator {
    yield* this.consume;
  }

  toJSON(): IBonus {
    return {
      type: EObject.BONUS,
      bonusType: this.type,
    };
  }
}
