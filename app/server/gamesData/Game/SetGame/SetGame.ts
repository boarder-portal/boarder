import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import {
  ESetCardColor,
  ESetCardFill,
  ESetCardShape,
  ESetGameEvent,
  ISetCard,
  ISetPlayer,
} from 'common/types/set';
import { ISetGameInfoEvent, ISetSendSetEvent } from 'common/types/set/events';
import { EGame } from 'common/types/game';

import isSet from 'server/gamesData/Game/SetGame/utilities/isSet';
import isNotUndefined from 'common/utilities/isNotUndefined';
import isAnySet from 'server/gamesData/Game/SetGame/utilities/isAnySet';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.SET]: {
      startCardCountToShow,
      cardsCountToAddIfNoSet,
      pointsForSet,
      pointsForWrongSet,
      pointsForUnderstandingThereAreNoSet,
      pointsForWrongUnderstandingThereAreNoSet,
    },
  },
} = GAMES_CONFIG;

class SetGame extends Game<EGame.SET> {
  handlers = {
    [ESetGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [ESetGameEvent.SEND_SET]: this.onSendSet,
    [ESetGameEvent.SEND_NO_SET]: this.onSendNoSet,
  };

  cardsStack: ISetCard[] = [];
  maxCardsToShow = startCardCountToShow;

  constructor(options: IGameCreateOptions<EGame.SET>) {
    super(options);

    this.setupGame();
  }

  createPlayer(roomPlayer: IPlayer): ISetPlayer {
    return {
      ...roomPlayer,
      score: 0,
    };
  }

  setupGame() {
    const notShuffledCardsStack: ISetCard[] = [];

    Object.values(ESetCardColor).forEach((color) => {
      Object.values(ESetCardShape).forEach((shape) => {
        Object.values(ESetCardFill).forEach((fill) => {
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

  onGetGameInfo({ socket }: IGameEvent) {
    const data: ISetGameInfoEvent = {
      players: this.players,
      cards: this.cardsStack.slice(0, this.maxCardsToShow),
    };

    socket.emit(ESetGameEvent.GAME_INFO, data);
  }

  onSendSet({ socket, data }: IGameEvent<ISetSendSetEvent>) {
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

      player.score += pointsForSet;

      this.maxCardsToShow = Math.max(startCardCountToShow, this.maxCardsToShow - cardsCountToAddIfNoSet);
    } else {
      player.score += pointsForWrongSet;
    }

    this.sendGameUpdate();

    if (!isAnySet(this.cardsStack)) {
      this.end();
    }
  }

  onSendNoSet({ socket }: IGameEvent) {
    const player = this.getPlayerByLogin(socket.user?.login);

    if (!player) {
      throw new Error('There are no player');
    }

    if (isAnySet(this.cardsStack.slice(0, this.maxCardsToShow))) {
      player.score += pointsForWrongUnderstandingThereAreNoSet;
    } else {
      player.score += pointsForUnderstandingThereAreNoSet;

      this.maxCardsToShow += cardsCountToAddIfNoSet;
    }

    this.sendGameUpdate();
  }

  sendGameUpdate() {
    const data: ISetGameInfoEvent = {
      players: this.players,
      cards: this.cardsStack.slice(0, this.maxCardsToShow),
    };

    this.io.emit(ESetGameEvent.GAME_INFO, data);
  }
}

export default SetGame;
