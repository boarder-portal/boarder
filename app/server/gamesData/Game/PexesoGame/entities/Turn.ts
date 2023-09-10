import { GameType } from 'common/types/game';
import { GameClientEventType, GameServerEventType, Turn as TurnModel } from 'common/types/games/pexeso';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';

export interface TurnOptions {
  activePlayerIndex: number;
}

export default class Turn extends ServerEntity<GameType.PEXESO, number[]> {
  game: PexesoGame;
  activePlayerIndex: number;

  openedCardsIndexes: number[] = [];

  constructor(game: PexesoGame, options: TurnOptions) {
    super(game);

    this.game = game;
    this.activePlayerIndex = options.activePlayerIndex;
  }

  *lifecycle(): EntityGenerator<number[]> {
    while (this.openedCardsIndexes.length < this.options.matchingCardsCount) {
      const cardIndex = yield* this.waitForPlayerSocketEvent(GameClientEventType.OPEN_CARD, {
        playerIndex: this.activePlayerIndex,
        validate: this.validateOpenCardEvent,
      });

      this.openedCardsIndexes.push(cardIndex);

      this.sendSocketEvent(GameServerEventType.OPEN_CARD, cardIndex);
    }

    return this.openedCardsIndexes;
  }

  toJSON(): TurnModel {
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
