import shuffle from 'lodash/shuffle';
import random from 'lodash/random';

import { EGame } from 'common/types/game';
import { EGameClientEvent, EHandStage, IPlayer } from 'common/types/hearts';

import BotEntity from 'server/gamesData/Game/utilities/BotEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import isCardAllowed from 'common/utilities/hearts/isCardAllowed';
import isFirstTurn from 'common/utilities/hearts/isFirstTurn';
import getPlayedSuit from 'common/utilities/hearts/getPlayedSuit';
import { getRandomElement } from 'common/utilities/random';

export default class HeartsBot extends BotEntity<EGame.HEARTS> {
  *lifecycle(): TGenerator {
    while (true) {
      yield* this.waitForNewHand();

      if (this.getGameInfo().hand?.stage === EHandStage.PASS) {
        const hand = this.getPlayer().data.hand?.hand;

        if (hand) {
          const indexes = shuffle(hand.map((_, index) => index)).slice(0, 3);

          for (const index of indexes) {
            yield* this.delay(random(200, 300));

            this.sendSocketEvent(EGameClientEvent.CHOOSE_CARD, index);
          }
        }

        yield* this.refreshGameInfo();
      }

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

          this.sendSocketEvent(EGameClientEvent.CHOOSE_CARD, getRandomElement(indexes));
        }

        yield* this.refreshGameInfo();
      }
    }
  }

  getPlayer(): IPlayer {
    return this.getGameInfo().players[this.playerIndex];
  }

  *waitForNewHand(): TGenerator {
    while (true) {
      if (this.getPlayer().data.hand?.hand.length) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }

  *waitForTurn(): TGenerator {
    while (true) {
      if (this.getGameInfo().hand?.turn?.activePlayerIndex === this.playerIndex) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }
}
