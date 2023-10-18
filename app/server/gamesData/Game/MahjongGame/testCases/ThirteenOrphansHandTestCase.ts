import { GameType } from 'common/types/game';
import { GameEventType, Suit } from 'common/types/games/mahjong';

import { suited } from 'common/utilities/games/mahjong/tilesBase';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import TestCase from 'server/gamesData/Game/utilities/Entity/components/TestCase';

export default class ThirteenOrphansHandTestCase extends Entity {
  testCase = this.getClosestComponent(TestCase<GameType.MAHJONG>);

  gameInfo = this.obtainComponent(GameInfo<GameType.MAHJONG, this>);

  *lifecycle(): EntityGenerator {
    while (true) {
      const hand = yield* this.testCase.waitForGameEvent(GameEventType.HAND_STARTED);

      this.gameInfo.forEachPlayer((playerIndex, player) => {
        if (!player.isBot) {
          hand.playersData.get(playerIndex).hand = [
            suited(1, Suit.CHARACTERS),
            suited(1, Suit.CHARACTERS),
            suited(1, Suit.CHARACTERS),
            suited(2, Suit.CHARACTERS),
            suited(3, Suit.CHARACTERS),
            suited(4, Suit.CHARACTERS),
            suited(5, Suit.CHARACTERS),
            suited(6, Suit.CHARACTERS),
            suited(7, Suit.CHARACTERS),
            suited(8, Suit.CHARACTERS),
            suited(9, Suit.CHARACTERS),
            suited(9, Suit.CHARACTERS),
            suited(9, Suit.CHARACTERS),
          ];
        }
      });
    }
  }
}
