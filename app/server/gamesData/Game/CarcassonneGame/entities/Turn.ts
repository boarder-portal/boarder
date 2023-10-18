import { GameType } from 'common/types/game';
import { GameClientEventType, Turn as TurnModel } from 'common/types/games/carcassonne';

import Timestamp from 'common/utilities/Timestamp';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';

import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';

export interface TurnOptions {
  duration: number;
}

export default class Turn extends Entity<boolean> {
  game = this.getClosestEntity(CarcassonneGame);

  time = this.addComponent(Time, {
    getBoundTimestamps: () => [this.endsAt],
  });
  server = this.obtainComponent(Server<GameType.CARCASSONNE, this>);
  gameInfo = this.obtainComponent(GameInfo<GameType.CARCASSONNE, this>);

  endsAt: Timestamp;
  placedAnyCards = false;

  constructor(options: TurnOptions) {
    super();

    this.endsAt = this.time.createTimestamp(options.duration);
  }

  *lifecycle(): EntityGenerator<boolean> {
    yield* this.race([
      this.gameInfo.options.withTimer ? this.time.waitForTimestamp(this.endsAt) : null,
      this.makeMoves(),
    ]);

    return this.placedAnyCards;
  }

  *makeMoves(): EntityGenerator {
    let isBuilderMove = false;

    while (true) {
      const { cardIndex, coords, rotation, meeple } = yield* this.server.waitForActivePlayerSocketEvent(
        GameClientEventType.ATTACH_CARD,
      );

      const attachedToBuilder = this.game.attachPlayerCard({
        cardIndex,
        coords,
        rotation,
        meeple,
        isFirstTurnCard: !isBuilderMove,
      });

      this.placedAnyCards = true;

      if (
        isBuilderMove ||
        !attachedToBuilder ||
        !this.game.canPlayAnyCards(this.game.turnController.activePlayerIndex)
      ) {
        break;
      }

      isBuilderMove = true;
    }
  }

  toJSON(): TurnModel {
    return {
      endsAt: this.endsAt,
    };
  }
}
