import { CARDS_IN_HAND } from 'common/constants/games/carcassonne';

import { GameType } from 'common/types/game';
import { GameEventType } from 'common/types/games/carcassonne';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import TestCase from 'server/gamesData/Game/utilities/Entity/components/TestCase';

export default class ShortDeckTestCase extends Entity {
  testCase = this.getClosestComponent(TestCase<GameType.CARCASSONNE>);

  gameInfo = this.obtainComponent(GameInfo<GameType.MAHJONG, this>);

  *lifecycle(): EntityGenerator {
    while (true) {
      const game = yield* this.testCase.waitForGameEvent(GameEventType.GAME_STARTED);

      game.deck.splice(this.gameInfo.playersCount * CARDS_IN_HAND + 2);
    }
  }
}
