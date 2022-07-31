import random from 'lodash/random';

import { EGame } from 'common/types/game';
import { EGameClientEvent, IPlayer } from 'common/types/mahjong';

import BotEntity from 'server/gamesData/Game/utilities/BotEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import { getRandomIndex } from 'common/utilities/random';

export default class MahjongBot extends BotEntity<EGame.MAHJONG> {
  *lifecycle(): TGenerator {
    while (true) {
      yield* this.waitForHand();

      while (!this.isHandOver()) {
        if (this.getGameInfo().round?.hand?.activePlayerIndex === this.playerIndex) {
          const hand = this.getPlayer().data.hand?.hand;

          if (hand) {
            yield* this.delay(random(200, 300));

            this.sendSocketEvent(EGameClientEvent.DISCARD_TILE, getRandomIndex(hand.length));
          }
        } else {
          const { type } = yield* this.race({
            declare: this.waitForDeclareAction(),
            handEnd: this.waitForHandEnd(),
          });

          if (type === 'handEnd') {
            break;
          }

          const { data } = this.getPlayer();

          if (data.turn?.declareDecision === null && !data.round?.readyForNewHand) {
            this.sendSocketEvent(EGameClientEvent.DECLARE, 'pass');
          }
        }

        yield* this.refreshGameInfo();
      }

      this.sendSocketEvent(EGameClientEvent.READY_FOR_NEW_HAND, true);

      yield* this.refreshGameInfo();
    }
  }

  getPlayer(): IPlayer {
    return this.getGameInfo().players[this.playerIndex];
  }

  isHandOver(): boolean {
    return this.getGameInfo().round?.hand?.activePlayerIndex === -1;
  }

  *waitForDeclareAction(): TGenerator {
    while (true) {
      if (this.getGameInfo().round?.hand?.turn?.declareInfo) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }

  *waitForHand(): TGenerator {
    while (true) {
      if (Number(this.getGameInfo().round?.hand?.activePlayerIndex) > -1) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }

  *waitForHandEnd(): TGenerator {
    while (true) {
      if (this.getGameInfo().round?.hand?.activePlayerIndex === -1) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }
}
