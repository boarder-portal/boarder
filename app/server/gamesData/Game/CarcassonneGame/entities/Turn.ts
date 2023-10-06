import { GameType } from 'common/types/game';
import { GameClientEventType, Turn as TurnModel } from 'common/types/games/carcassonne';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import Timestamp from 'common/utilities/Timestamp';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';

export interface TurnOptions {
  duration: number;
}

export default class Turn extends ServerEntity<GameType.CARCASSONNE, boolean> {
  game: CarcassonneGame;

  endsAt: Timestamp;
  placedAnyCards = false;

  constructor(game: CarcassonneGame, options: TurnOptions) {
    super(game);

    this.game = game;
    this.endsAt = this.createTimestamp(options.duration);
  }

  *lifecycle(): EntityGenerator<boolean> {
    yield* this.race([this.options.withTimer ? this.waitForTimestamp(this.endsAt) : null, this.makeMoves()]);

    return this.placedAnyCards;
  }

  getCurrentTimestamps(): (Timestamp | null | undefined)[] {
    return [this.endsAt];
  }

  *makeMoves(): EntityGenerator {
    let isBuilderMove = false;

    while (true) {
      const { cardIndex, coords, rotation, meeple } = yield* this.waitForActivePlayerSocketEvent(
        GameClientEventType.ATTACH_CARD,
        {
          turnController: this.game.turnController,
        },
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
