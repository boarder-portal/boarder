import times from 'lodash/times';
import shuffle from 'lodash/shuffle';
import isNumber from 'lodash/isNumber';

import {
  NEW_CARDS_COUNT,
  NO_SET_POINTS,
  SET_POINTS,
  START_CARDS_COUNT,
  WRONG_NO_SET_POINTS,
  WRONG_SET_POINTS,
} from 'common/constants/games/set';

import { EGame } from 'common/types/game';
import {
  ECardColor,
  ECardFill,
  ECardShape,
  EGameClientEvent,
  ICard,
  IGame,
  IPlayer,
  IPlayerData,
  ISendSetEvent,
} from 'common/types/set';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import isAnySet from 'server/gamesData/Game/SetGame/utilities/isAnySet';
import isNotUndefined from 'common/utilities/isNotUndefined';
import isSet from 'server/gamesData/Game/SetGame/utilities/isSet';
import hasOwnProperty from 'common/utilities/hasOwnProperty';
import isArray from 'common/utilities/isArray';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

export default class SetGame extends GameEntity<EGame.SET> {
  playersData: IPlayerData[] = this.getPlayersData(() => ({
    score: 0,
  }));
  cardsStack: ICard[] = [];
  maxCardsToShow = START_CARDS_COUNT;

  *lifecycle(): TGenerator {
    const notShuffledCardsStack: ICard[] = [];

    Object.values(ECardColor).forEach((color) => {
      Object.values(ECardShape).forEach((shape) => {
        Object.values(ECardFill).forEach((fill) => {
          times(3).forEach((countIndex) => {
            notShuffledCardsStack.push({
              id: notShuffledCardsStack.length,
              color,
              count: countIndex + 1,
              shape,
              fill,
            });
          });
        });
      });
    });

    this.cardsStack = shuffle(notShuffledCardsStack);

    while (true) {
      const { type, value } = yield* this.race({
        sendSet: this.waitForSocketEvent(EGameClientEvent.SEND_SET, {
          validate: this.validateSendSetEvent,
        }),
        sendNoSet: this.waitForSocketEvent(EGameClientEvent.SEND_NO_SET),
      });

      const playerData = this.playersData[value.playerIndex];

      if (type === 'sendSet') {
        const { cardsIds } = value.data;

        const cards = cardsIds
          .map((cardId) => this.cardsStack.find((card) => card.id === cardId))
          .filter(isNotUndefined);

        if (isSet(cards)) {
          const isAnyHiddenCard = this.cardsStack.length > this.maxCardsToShow;

          cards.forEach((card) => {
            const cardStackIndex = this.cardsStack.findIndex(({ id }) => id === card.id);

            if (cardStackIndex === -1) {
              throw new Error(`There is no cardStackIndex: ${cardStackIndex}`);
            }

            if (isAnyHiddenCard) {
              const lastCard = this.cardsStack.pop();

              if (!lastCard) {
                throw new Error('There is no last card');
              }

              this.cardsStack[cardStackIndex] = lastCard;
            } else {
              this.cardsStack.splice(cardStackIndex, 1);
            }
          });

          playerData.score += SET_POINTS;

          this.maxCardsToShow = Math.max(START_CARDS_COUNT, this.maxCardsToShow - NEW_CARDS_COUNT);
        } else {
          playerData.score += WRONG_SET_POINTS;
        }

        this.sendGameInfo();

        if (!isAnySet(this.cardsStack)) {
          break;
        }
      } else {
        if (isAnySet(this.cardsStack.slice(0, this.maxCardsToShow))) {
          playerData.score += WRONG_NO_SET_POINTS;
        } else {
          playerData.score += NO_SET_POINTS;

          this.maxCardsToShow += NEW_CARDS_COUNT;
        }

        this.sendGameInfo();
      }
    }
  }

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
      cards: this.cardsStack.slice(0, this.maxCardsToShow),
    };
  }

  validateSendSetEvent = (event: unknown): asserts event is ISendSetEvent => {
    if (!event || typeof event !== 'object') {
      throw new Error('Wrong event object');
    }

    if (!hasOwnProperty(event, 'cardsIds')) {
      throw new Error('No cardIds');
    }

    const { cardsIds } = event;

    if (!isArray(cardsIds) || !cardsIds.every(isNumber)) {
      throw new Error('Wrong cardIds property');
    }
  };
}
