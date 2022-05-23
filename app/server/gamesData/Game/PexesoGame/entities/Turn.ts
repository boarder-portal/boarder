import { EGame } from 'common/types/game';
import { EGameClientEvent, EGameServerEvent, ITurn } from 'common/types/pexeso';

import Entity, { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';

export interface ITurnOptions {
  activePlayerIndex: number;
}

export default class Turn extends Entity<EGame.PEXESO, number[]> {
  game: PexesoGame;
  activePlayerIndex: number;

  openedCardsIndexes: number[] = [];

  constructor(game: PexesoGame, options: ITurnOptions) {
    super(game);

    this.game = game;
    this.activePlayerIndex = options.activePlayerIndex;
  }

  *lifecycle(): TGenerator<number[]> {
    while (this.openedCardsIndexes.length < this.options.matchingCardsCount) {
      const cardIndex = yield* this.waitForPlayerSocketEvent(EGameClientEvent.OPEN_CARD, {
        playerIndex: this.activePlayerIndex,
        validate: this.validateOpenCardEvent,
      });

      this.openedCardsIndexes.push(cardIndex);

      this.sendSocketEvent(EGameServerEvent.OPEN_CARD, cardIndex);
    }

    return this.openedCardsIndexes;
  }

  toJSON(): ITurn {
    return {
      openedCardsIndexes: this.openedCardsIndexes,
    };
  }

  validateOpenCardEvent = (cardIndex: unknown): asserts cardIndex is number => {
    if (typeof cardIndex !== 'number') {
      throw new Error('Invalid number');
    }

    if (!this.game.isCardInGame(cardIndex)) {
      throw new Error('Card is not in game');
    }

    if (this.openedCardsIndexes.includes(cardIndex)) {
      throw new Error('Already opened');
    }
  };
}
