import { Bonus as BonusModel, BonusType, ObjectType } from 'common/types/bombers';
import { GameType } from 'common/types/game';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface BonusOptions {
  id: number;
  type: BonusType;
}

export default class Bonus extends ServerEntity<GameType.BOMBERS> {
  id: number;
  type: BonusType;

  consume = this.createTrigger();

  constructor(game: BombersGame, options: BonusOptions) {
    super(game);

    this.id = options.id;
    this.type = options.type;
  }

  *lifecycle(): EntityGenerator {
    yield* this.consume;
  }

  toJSON(): BonusModel {
    return {
      type: ObjectType.BONUS,
      id: this.id,
      bonusType: this.type,
    };
  }
}
