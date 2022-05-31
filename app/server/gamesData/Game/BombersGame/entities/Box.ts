import { BONUS_PROBABILITY, BONUSES_WEIGHTS } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EBonus, EObject, IBox } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { getWeightedRandomKey } from 'common/utilities/random';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBoxOptions {
  cell: IServerCell;
}

export default class Box extends ServerEntity<EGame.BOMBERS, EBonus | null> {
  cell: IServerCell;

  explodeTrigger = this.createTrigger<EBonus | null>();

  constructor(game: BombersGame, options: IBoxOptions) {
    super(game);

    this.cell = options.cell;
  }

  *lifecycle(): TGenerator<EBonus | null> {
    return yield* this.explodeTrigger;
  }

  explode(): void {
    this.explodeTrigger(Math.random() < BONUS_PROBABILITY ? getWeightedRandomKey(BONUSES_WEIGHTS) : null);
  }

  toJSON(): IBox {
    return {
      type: EObject.BOX,
    };
  }
}
