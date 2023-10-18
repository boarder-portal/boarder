import random from 'lodash/random';

import { GameType } from 'common/types/game';
import { GameClientEventType } from 'common/types/games/mahjong';

import { getRandomIndex } from 'common/utilities/random';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';
import Bot from 'server/gamesData/Game/utilities/Entity/entities/Bot';

export default class MahjongBot extends Entity {
  bot = this.getClosestEntity(Bot<GameType.MAHJONG>);

  time = this.obtainComponent(Time);

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
          const hand = this.bot.getPlayer().data.hand?.hand;

          if (hand) {
            yield* this.time.delay(random(200, 700));

            this.bot.client.sendSocketEvent(GameClientEventType.DISCARD_TILE, getRandomIndex(hand.length));
          }
        } else {
          const { data } = this.bot.getPlayer();

          if (data.turn?.declareDecision === null) {
            this.bot.client.sendSocketEvent(GameClientEventType.DECLARE, 'pass');
          }
        }

        yield* this.bot.refreshGameInfo();
      }

      this.bot.client.sendSocketEvent(GameClientEventType.READY_FOR_NEW_HAND, true);

      yield* this.bot.refreshGameInfo();
    }
  }

  *waitForDeclareAction(): EntityGenerator {
    while (true) {
      if (
        this.bot.getGameInfo().round?.hand?.turn?.declareInfo &&
        this.bot.getPlayer().data.turn?.declareDecision === null
      ) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }

  *waitForHand(): EntityGenerator {
    while (true) {
      if (Number(this.bot.getGameInfo().round?.hand?.activePlayerIndex) > -1) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }

  *waitForHandEnd(): EntityGenerator {
    while (true) {
      if (this.bot.getGameInfo().round?.hand?.activePlayerIndex === -1) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }

  *waitForOwnTurn(): EntityGenerator {
    while (true) {
      if (
        this.bot.getGameInfo().round?.hand?.activePlayerIndex === this.bot.playerIndex &&
        !this.bot.getGameInfo().round?.hand?.turn?.declareInfo
      ) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }
}
