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
        validate: (cardIndex) => this.game.isCardInGame(cardIndex) && !this.openedCardsIndexes.includes(cardIndex),
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
}
