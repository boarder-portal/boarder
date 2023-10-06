import { GameType } from 'common/types/game';
import { GameEventType, Suit } from 'common/types/games/mahjong';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import { suited } from 'common/utilities/games/mahjong/tilesBase';
import TestCaseEntity from 'server/gamesData/Game/utilities/TestCaseEntity';

export default class ThirteenOrphansHandTestCase extends TestCaseEntity<GameType.MAHJONG> {
  *lifecycle(): EntityGenerator {
    while (true) {
      const hand = yield* this.waitForGameEvent(GameEventType.HAND_STARTED);

      hand.forEachPlayer((playerIndex, player) => {
        if (!player.isBot) {
          hand.playersData[playerIndex].hand = [
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
