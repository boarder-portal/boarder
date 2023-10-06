import { BONUSES_WEIGHTS, BONUS_PROBABILITY } from 'common/constants/games/bombers';

import { GameType } from 'common/types/game';
import { BonusType, Box as BoxModel, ObjectType } from 'common/types/games/bombers';

import { EntityGenerator } from 'common/utilities/Entity';
import { getWeightedRandomKey } from 'common/utilities/random';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame, { ServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface BoxOptions {
  id: number;
  cell: ServerCell;
}

export default class Box extends ServerEntity<GameType.BOMBERS, BonusType | null> {
  id: number;
  cell: ServerCell;

  explodeTrigger = this.createTrigger<BonusType | null>();

  constructor(game: BombersGame, options: BoxOptions) {
    super(game);

    this.id = options.id;
    this.cell = options.cell;
  }

  *lifecycle(): EntityGenerator<BonusType | null> {
    return yield* this.waitForTrigger(this.explodeTrigger);
  }

  explode(): void {
    this.explodeTrigger.activate(Math.random() < BONUS_PROBABILITY ? getWeightedRandomKey(BONUSES_WEIGHTS) : null);
  }

  toJSON(): BoxModel {
    return {
      type: ObjectType.BOX,
      id: this.id,
    };
  }
}
