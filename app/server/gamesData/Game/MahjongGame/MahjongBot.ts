import random from 'lodash/random';

import { GameType } from 'common/types/game';
import { GameClientEventType, Player } from 'common/types/games/mahjong';

import { EntityGenerator } from 'common/utilities/Entity';
import { getRandomIndex } from 'common/utilities/random';
import BotEntity from 'server/gamesData/Game/utilities/BotEntity';

export default class MahjongBot extends BotEntity<GameType.MAHJONG> {
  *lifecycle(): EntityGenerator {
    while (true) {
      yield* this.waitForHand();

      while (true) {
        const { type } = yield* this.race({
          ownTurn: this.waitForOwnTurn(),
          declare: this.waitForDeclareAction(),
          handEnd: this.waitForHandEnd(),
        });

        if (type === 'handEnd') {
          break;
        }

        if (type === 'ownTurn') {
          const hand = this.getPlayer().data.hand?.hand;

          if (hand) {
            yield* this.delay(random(200, 700));

            this.sendSocketEvent(GameClientEventType.DISCARD_TILE, getRandomIndex(hand.length));
          }
        } else {
          const { data } = this.getPlayer();

          if (data.turn?.declareDecision === null) {
            this.sendSocketEvent(GameClientEventType.DECLARE, 'pass');
          }
        }

        yield* this.refreshGameInfo();
      }

      this.sendSocketEvent(GameClientEventType.READY_FOR_NEW_HAND, true);

      yield* this.refreshGameInfo();
    }
  }

  getPlayer(): Player {
    return this.getGameInfo().players[this.playerIndex];
  }

  *waitForDeclareAction(): EntityGenerator {
    while (true) {
      if (this.getGameInfo().round?.hand?.turn?.declareInfo && this.getPlayer().data.turn?.declareDecision === null) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }

  *waitForHand(): EntityGenerator {
    while (true) {
      if (Number(this.getGameInfo().round?.hand?.activePlayerIndex) > -1) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }

  *waitForHandEnd(): EntityGenerator {
    while (true) {
      if (this.getGameInfo().round?.hand?.activePlayerIndex === -1) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }

  *waitForOwnTurn(): EntityGenerator {
    while (true) {
      if (
        this.getGameInfo().round?.hand?.activePlayerIndex === this.playerIndex &&
        !this.getGameInfo().round?.hand?.turn?.declareInfo
      ) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }
}
