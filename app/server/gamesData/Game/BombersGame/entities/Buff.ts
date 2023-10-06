import pick from 'lodash/pick';

import { GameType } from 'common/types/game';
import { Buff as BuffModel, BuffType } from 'common/types/games/bombers';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import Timestamp from 'common/utilities/Timestamp';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import Player from 'server/gamesData/Game/BombersGame/entities/Player';

export interface BuffOptions {
  type: BuffType;
  endsAt: Timestamp;
}

export default class Buff extends ServerEntity<GameType.BOMBERS> {
  player: Player;

  type: BuffType;
  endsAt: Timestamp;

  postponeTrigger = this.createTrigger<Timestamp>();

  constructor(player: Player, options: BuffOptions) {
    super(player);

    this.player = player;
    this.type = options.type;
    this.endsAt = options.endsAt;
  }

  *lifecycle(): EntityGenerator {
    while (true) {
      const { type, value } = yield* this.race({
        timeout: this.waitForTimestamp(this.endsAt),
        postpone: this.waitForTrigger(this.postponeTrigger),
      });

      if (type === 'timeout') {
        break;
      }

      this.endsAt = value;
    }
  }

  postpone(endsAt: Timestamp): void {
    this.postponeTrigger.activate(endsAt);
  }

  toJSON(): BuffModel {
    return pick(this, ['type', 'endsAt']);
  }
}
