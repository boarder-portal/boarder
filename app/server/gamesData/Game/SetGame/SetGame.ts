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

import { IPlayer as ICommonPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import {
  ECardColor,
  ECardFill,
  ECardShape,
  EGameEvent,
  ICard,
  IPlayer,
} from 'common/types/set';
import { IGameInfoEvent, ISendSetEvent } from 'common/types/set/events';
import { EGame } from 'common/types/game';

import isSet from 'server/gamesData/Game/SetGame/utilities/isSet';
import isNotUndefined from 'common/utilities/isNotUndefined';
import isAnySet from 'server/gamesData/Game/SetGame/utilities/isAnySet';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

class SetGame extends Game<EGame.SET> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EGameEvent.SEND_SET]: this.onSendSet,
    [EGameEvent.SEND_NO_SET]: this.onSendNoSet,
  };

  cardsStack: ICard[] = [];
  maxCardsToShow = START_CARDS_COUNT;

  constructor(options: IGameCreateOptions<EGame.SET>) {
    super(options);

    this.setupGame();
  }

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      score: 0,
    };
  }

  setupGame(): void {
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
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    const data: IGameInfoEvent = {
      players: this.players,
      cards: this.cardsStack.slice(0, this.maxCardsToShow),
    };

    socket.emit(EGameEvent.GAME_INFO, data);
  }

  onSendSet({ socket, data }: IGameEvent<ISendSetEvent>): void {
    const { cardsIds } = data;

    const player = this.getPlayerByLogin(socket.user?.login);

    if (!player) {
      throw new Error('There is no player');
    }

    const cards = cardsIds
      .map((cardId) =>
        this.cardsStack.find((card) => card.id === cardId),
      )
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

      player.score += SET_POINTS;

      this.maxCardsToShow = Math.max(START_CARDS_COUNT, this.maxCardsToShow - NEW_CARDS_COUNT);
    } else {
      player.score += WRONG_SET_POINTS;
    }

    this.sendGameUpdate();

    if (!isAnySet(this.cardsStack)) {
      this.end();
    }
  }

  onSendNoSet({ socket }: IGameEvent): void {
    const player = this.getPlayerByLogin(socket.user?.login);

    if (!player) {
      throw new Error('There are no player');
    }

    if (isAnySet(this.cardsStack.slice(0, this.maxCardsToShow))) {
      player.score += WRONG_NO_SET_POINTS;
    } else {
      player.score += NO_SET_POINTS;

      this.maxCardsToShow += NEW_CARDS_COUNT;
    }

    this.sendGameUpdate();
  }

  sendGameUpdate(): void {
    const data: IGameInfoEvent = {
      players: this.players,
      cards: this.cardsStack.slice(0, this.maxCardsToShow),
    };

    this.io.emit(EGameEvent.GAME_INFO, data);
  }
}

export default SetGame;
