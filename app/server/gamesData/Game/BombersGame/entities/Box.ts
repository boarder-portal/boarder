import { BONUSES_WEIGHTS, BONUS_PROBABILITY } from 'common/constants/games/bombers';

import { BonusType, Box as BoxModel, ObjectType } from 'common/types/games/bombers';

import { getWeightedRandomKey } from 'common/utilities/random';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Events from 'server/gamesData/Game/utilities/Entity/components/Events';

import { ServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface BoxOptions {
  id: number;
  cell: ServerCell;
}

export default class Box extends Entity<BonusType | null> {
  events = this.obtainComponent(Events);

  id: number;
  cell: ServerCell;
  explodeEvent = this.events.createEvent<BonusType | null>();

  constructor(options: BoxOptions) {
    super();

    this.id = options.id;
    this.cell = options.cell;
  }

  *lifecycle(): EntityGenerator<BonusType | null> {
    return yield* this.events.waitForEvent(this.explodeEvent);
  }

  explode(): void {
    this.explodeEvent.dispatch(Math.random() < BONUS_PROBABILITY ? getWeightedRandomKey(BONUSES_WEIGHTS) : null);
  }

  toJSON(): BoxModel {
    return {
      type: ObjectType.BOX,
      id: this.id,
    };
  }
}
