import { GameType } from 'common/types/game';
import { GamePhaseType } from 'common/types/games/outerMinds';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';
import Bot from 'server/gamesData/Game/utilities/Entity/entities/Bot';

export default class OuterMindsBot extends Entity {
  bot = this.getClosestEntity(Bot<GameType.OUTER_MINDS>);

  time = this.obtainComponent(Time);

  *lifecycle(): EntityGenerator {
    yield* this.waitForHandDraftPhase();

    while (true) {
      break;
    }
  }

  *waitForHandDraftPhase(): EntityGenerator {
    while (true) {
      if (this.bot.getGameInfo()?.phase?.type === GamePhaseType.HAND_DRAFT) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }
}
