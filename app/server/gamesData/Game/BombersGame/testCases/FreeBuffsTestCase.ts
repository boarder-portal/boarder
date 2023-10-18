import { GameType } from 'common/types/game';
import { BuffType, GameEventType } from 'common/types/games/bombers';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import TestCase from 'server/gamesData/Game/utilities/Entity/components/TestCase';

export default class FreeBuffsTestCase extends Entity {
  testCase = this.getClosestComponent(TestCase<GameType.BOMBERS>);

  *lifecycle(): EntityGenerator {
    const game = yield* this.testCase.waitForGameEvent(GameEventType.GAME_STARTED);

    Object.values(BuffType).forEach((buffType) => {
      game.buffCosts[buffType] = 0;
    });
  }
}
