import pick from 'lodash/pick';

import { Buff as BuffModel, BuffType } from 'common/types/games/bombers';

import Timestamp from 'common/utilities/Timestamp';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Events from 'server/gamesData/Game/utilities/Entity/components/Events';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';

import Player from 'server/gamesData/Game/BombersGame/entities/Player';

export interface BuffOptions {
  type: BuffType;
  endsAt: Timestamp;
}

export default class Buff extends Entity {
  player = this.getClosestEntity(Player);

  time = this.addComponent(Time, {
    getBoundTimestamps: () => [this.endsAt],
  });
  events = this.obtainComponent(Events);

  type: BuffType;
  endsAt: Timestamp;
  postponeEvent = this.events.createEvent<Timestamp>();

  constructor(options: BuffOptions) {
    super();

    this.type = options.type;
    this.endsAt = options.endsAt;
  }

  *lifecycle(): EntityGenerator {
    while (true) {
      const { type, value } = yield* this.race({
        timeout: this.time.waitForTimestamp(this.endsAt),
        postpone: this.events.waitForEvent(this.postponeEvent),
      });

      if (type === 'timeout') {
        break;
      }

      this.endsAt = value;
    }
  }

  postpone(endsAt: Timestamp): void {
    this.postponeEvent.dispatch(endsAt);
  }

  toJSON(): BuffModel {
    return pick(this, ['type', 'endsAt']);
  }
}
