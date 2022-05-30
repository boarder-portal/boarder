import { BONUS_PROBABILITY, BONUSES_WEIGHTS } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EBonus, EObject, IBox } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { getWeightedRandomKey } from 'common/utilities/random';

export default class Box extends ServerEntity<EGame.BOMBERS, EBonus | null> {
  explodeTrigger = this.createTrigger<EBonus | null>();

  *lifecycle(): TGenerator<EBonus | null> {
    return yield* this.explodeTrigger;
  }

  explode(): EBonus | null {
    const bonus = Math.random() < BONUS_PROBABILITY ? getWeightedRandomKey(BONUSES_WEIGHTS) : null;

    this.explodeTrigger(bonus);

    return bonus;
  }

  toJSON(): IBox {
    return {
      type: EObject.BOX,
    };
  }
}
