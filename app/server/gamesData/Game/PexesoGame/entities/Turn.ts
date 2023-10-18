import { GameType } from 'common/types/game';
import { GameClientEventType, GameServerEventType, Turn as TurnModel } from 'common/types/games/pexeso';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';

export default class Turn extends Entity<number[]> {
  game = this.getClosestEntity(PexesoGame);

  server = this.obtainComponent(Server<GameType.PEXESO, this>);
  gameInfo = this.obtainComponent(GameInfo<GameType.PEXESO, this>);

  openedCardsIndexes: number[] = [];

  *lifecycle(): EntityGenerator<number[]> {
    while (this.openedCardsIndexes.length < this.gameInfo.options.matchingCardsCount) {
      const cardIndex = yield* this.server.waitForActivePlayerSocketEvent(GameClientEventType.OPEN_CARD, {
        validate: (cardIndex) => this.game.isCardInGame(cardIndex) && !this.openedCardsIndexes.includes(cardIndex),
      });

      this.openedCardsIndexes.push(cardIndex);

      this.server.sendSocketEvent(GameServerEventType.OPEN_CARD, cardIndex);
    }

    return this.openedCardsIndexes;
  }

  toJSON(): TurnModel {
    return {
      openedCardsIndexes: this.openedCardsIndexes,
    };
  }
}
