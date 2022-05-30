import { EGame } from 'common/types/game';
import { EBonus, EObject, IBonus } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBonusOptions {
  type: EBonus;
  cell: IServerCell;
}

export default class Bonus extends ServerEntity<EGame.BOMBERS> {
  type: EBonus;
  cell: IServerCell;

  consume = this.createTrigger();

  constructor(game: BombersGame, options: IBonusOptions) {
    super(game);

    this.type = options.type;
    this.cell = options.cell;
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
