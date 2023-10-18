import { Bonus as BonusModel, BonusType, ObjectType } from 'common/types/games/bombers';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Events from 'server/gamesData/Game/utilities/Entity/components/Events';

export interface BonusOptions {
  id: number;
  type: BonusType;
}

export default class Bonus extends Entity {
  events = this.obtainComponent(Events);

  id: number;
  type: BonusType;
  consumeEvent = this.events.createEvent();

  constructor(options: BonusOptions) {
    super();

    this.id = options.id;
    this.type = options.type;
  }

  *lifecycle(): EntityGenerator {
    yield* this.events.waitForEvent(this.consumeEvent);
  }

  consume(): void {
    this.consumeEvent.dispatch();
  }

  toJSON(): BonusModel {
    return {
      type: ObjectType.BONUS,
      id: this.id,
      bonusType: this.type,
    };
  }
}
