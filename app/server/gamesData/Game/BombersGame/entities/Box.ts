import { BONUS_PROBABILITY, BONUSES_WEIGHTS } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { ICoords } from 'common/types';
import { EBonus, EObject, IBox } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { getWeightedRandomKey } from 'common/utilities/random';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBoxOptions {
  coords: ICoords;
}

export default class Box extends ServerEntity<EGame.BOMBERS, EBonus | null> {
  coords: ICoords;

  explodeTrigger = this.createTrigger<EBonus | null>();

  constructor(game: BombersGame, options: IBoxOptions) {
    super(game);

    this.coords = options.coords;
  }

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
