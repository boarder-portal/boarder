import random from 'lodash/random';
import shuffle from 'lodash/shuffle';

import { GameType } from 'common/types/game';
import { GameClientEventType, HandStage, Player } from 'common/types/hearts';

import getPlayedSuit from 'common/utilities/hearts/getPlayedSuit';
import isCardAllowed from 'common/utilities/hearts/isCardAllowed';
import isFirstTurn from 'common/utilities/hearts/isFirstTurn';
import { getRandomElement } from 'common/utilities/random';
import BotEntity from 'server/gamesData/Game/utilities/BotEntity';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';

export default class HeartsBot extends BotEntity<GameType.HEARTS> {
  *lifecycle(): EntityGenerator {
    while (true) {
      yield* this.waitForNewHand();

      if (this.getGameInfo().hand?.stage === HandStage.PASS) {
        const hand = this.getPlayer().data.hand?.hand;

        if (hand) {
          const indexes = shuffle(hand.map((_, index) => index)).slice(0, 3);

          yield* this.delay(random(200, 300));

          for (const index of indexes) {
            this.sendSocketEvent(GameClientEventType.CHOOSE_CARD, index);
          }
        }
      }

      yield* this.waitForPlayStage();

      while (this.getPlayer().data.hand?.hand.length) {
        yield* this.waitForTurn();

        const gameInfo = this.getGameInfo();
        const hand = this.getPlayer().data.hand?.hand;

        if (hand) {
          const indexes = hand
            .map((_, index) => index)
            .filter((index) =>
              isCardAllowed({
                card: hand[index],
                hand,
                suit: getPlayedSuit(gameInfo),
                heartsEnteredPlay: gameInfo.hand?.heartsEnteredPlay ?? false,
                isFirstTurn: isFirstTurn(gameInfo),
              }),
            );

          yield* this.delay(random(200, 700));

          this.sendSocketEvent(GameClientEventType.CHOOSE_CARD, getRandomElement(indexes));
        }

        yield* this.refreshGameInfo();
      }
    }
  }

  getPlayer(): Player {
    return this.getGameInfo().players[this.playerIndex];
  }

  *waitForNewHand(): EntityGenerator {
    while (true) {
      if (this.getPlayer().data.hand?.hand.length) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }

  *waitForPlayStage(): EntityGenerator {
    while (true) {
      if (this.getGameInfo().hand?.stage === HandStage.PLAY) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }

  *waitForTurn(): EntityGenerator {
    while (true) {
      if (this.getGameInfo().hand?.turn?.activePlayerIndex === this.playerIndex) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }
}
