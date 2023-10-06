import { GameType } from 'common/types/game';
import { GameClientEventType, GameServerEventType, Turn as TurnModel } from 'common/types/games/pexeso';

import { EntityGenerator } from 'common/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';

export default class Turn extends ServerEntity<GameType.PEXESO, number[]> {
  game: PexesoGame;

  openedCardsIndexes: number[] = [];

  constructor(game: PexesoGame) {
    super(game);

    this.game = game;
  }

  *lifecycle(): EntityGenerator<number[]> {
    while (this.openedCardsIndexes.length < this.options.matchingCardsCount) {
      const cardIndex = yield* this.waitForActivePlayerSocketEvent(GameClientEventType.OPEN_CARD, {
        turnController: this.game.turnController,
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
