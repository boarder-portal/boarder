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

      while (this.getGameInfo().round?.hand?.activePlayerIndex !== -1) {
        if (this.getGameInfo().round?.hand?.activePlayerIndex === this.playerIndex) {
          const hand = this.getPlayer().data.hand?.hand;

          if (hand) {
            yield* this.delay(random(200, 300));

            this.sendSocketEvent(EGameClientEvent.DISCARD_TILE, getRandomIndex(hand.length));
          }
        } else {
          yield* this.waitForDeclareAction();

          const declareDecision = this.getPlayer().data.turn?.declareDecision;

          if (declareDecision === null) {
            this.sendSocketEvent(EGameClientEvent.PASS);
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
}
