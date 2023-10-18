import random from 'lodash/random';
import shuffle from 'lodash/shuffle';

import { GameType } from 'common/types/game';
import { GameClientEventType, HandStage } from 'common/types/games/hearts';

import getPlayedSuit from 'common/utilities/games/hearts/getPlayedSuit';
import isCardAllowed from 'common/utilities/games/hearts/isCardAllowed';
import isFirstTurn from 'common/utilities/games/hearts/isFirstTurn';
import { getRandomElement } from 'common/utilities/random';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';
import Bot from 'server/gamesData/Game/utilities/Entity/entities/Bot';

export default class HeartsBot extends Entity {
  bot = this.getClosestEntity(Bot<GameType.HEARTS>);

  time = this.obtainComponent(Time);

  *lifecycle(): EntityGenerator {
    while (true) {
      yield* this.waitForNewHand();

      if (this.bot.getGameInfo().hand?.stage === HandStage.PASS) {
        const hand = this.bot.getPlayer().data.hand?.hand;

        if (hand) {
          const indexes = shuffle(hand.map((_, index) => index)).slice(0, 3);

          yield* this.time.delay(random(200, 300));

          for (const index of indexes) {
            this.bot.client.sendSocketEvent(GameClientEventType.CHOOSE_CARD, index);
          }
        }
      }

      yield* this.waitForPlayStage();

      while (this.bot.getPlayer().data.hand?.hand.length) {
        yield* this.waitForOwnTurn();

        const gameInfo = this.bot.getGameInfo();
        const hand = this.bot.getPlayer().data.hand?.hand;

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

          yield* this.time.delay(random(200, 700));

          this.bot.client.sendSocketEvent(GameClientEventType.CHOOSE_CARD, getRandomElement(indexes));
        }

        yield* this.bot.refreshGameInfo();
      }
    }
  }

  *waitForNewHand(): EntityGenerator {
    while (true) {
      if (this.bot.getPlayer().data.hand?.hand.length) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }

  *waitForOwnTurn(): EntityGenerator {
    while (true) {
      if (this.bot.getGameInfo().hand?.turn?.activePlayerIndex === this.bot.playerIndex) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }

  *waitForPlayStage(): EntityGenerator {
    while (true) {
      if (this.bot.getGameInfo().hand?.stage === HandStage.PLAY) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }
}
