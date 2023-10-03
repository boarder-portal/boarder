import isNumber from 'lodash/isNumber';
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import {
  NEW_CARDS_COUNT,
  NO_SET_POINTS,
  SET_POINTS,
  START_CARDS_COUNT,
  WRONG_NO_SET_POINTS,
  WRONG_SET_POINTS,
} from 'common/constants/games/set';

import { GameType } from 'common/types/game';
import {
  Card,
  CardColor,
  CardFill,
  CardShape,
  Game,
  GameClientEventType,
  GameResult,
  Player,
  PlayerData,
  SendSetEvent,
} from 'common/types/games/set';

import hasOwnProperty from 'common/utilities/hasOwnProperty';
import { isArray, isDefined } from 'common/utilities/is';
import isAnySet from 'server/gamesData/Game/SetGame/utilities/isAnySet';
import isSet from 'server/gamesData/Game/SetGame/utilities/isSet';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

export default class SetGame extends GameEntity<GameType.SET> {
  playersData: PlayerData[] = this.getPlayersData(() => ({
    score: 0,
  }));
  cardsStack: Card[] = [];
  maxCardsToShow = START_CARDS_COUNT;

  *lifecycle(): EntityGenerator<GameResult> {
    const notShuffledCardsStack: Card[] = [];

    Object.values(CardColor).forEach((color) => {
      Object.values(CardShape).forEach((shape) => {
        Object.values(CardFill).forEach((fill) => {
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
      const { event, data, playerIndex } = yield* this.waitForSocketEvents(
        [GameClientEventType.SEND_SET, GameClientEventType.SEND_NO_SET],
        {
          validate: (event, data) => {
            if (event === GameClientEventType.SEND_SET) {
              this.validateSendSetEvent(data);
            }
          },
        },
      );

      const playerData = this.playersData[playerIndex];

      if (event === GameClientEventType.SEND_SET) {
        const { cardsIds } = data;

        const cards = cardsIds.map((cardId) => this.cardsStack.find((card) => card.id === cardId)).filter(isDefined);

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

    return this.playersData.map(({ score }) => score);
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      cards: this.cardsStack.slice(0, this.maxCardsToShow),
    };
  }

  validateSendSetEvent(event: unknown): asserts event is SendSetEvent {
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
  }
}
