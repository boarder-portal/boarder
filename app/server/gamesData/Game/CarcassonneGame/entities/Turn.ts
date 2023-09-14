import { GameType } from 'common/types/game';
import { GameClientEventType, Turn as TurnModel } from 'common/types/games/carcassonne';

import Timestamp from 'common/utilities/Timestamp';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';

export interface TurnOptions {
  activePlayerIndex: number;
  duration: number;
}

export default class Turn extends ServerEntity<GameType.CARCASSONNE, boolean> {
  game: CarcassonneGame;

  activePlayerIndex: number;
  endsAt: Timestamp;
  placedAnyCards = false;

  constructor(game: CarcassonneGame, options: TurnOptions) {
    super(game);

    this.game = game;
    this.activePlayerIndex = options.activePlayerIndex;
    this.endsAt = this.createTimestamp(options.duration);
  }

  *lifecycle(): EntityGenerator<boolean> {
    yield* this.race([this.game.options.withTimer ? this.waitForTimestamp(this.endsAt) : null, this.makeMoves()]);

    return this.placedAnyCards;
  }

  getCurrentTimestamps(): (Timestamp | null | undefined)[] {
    return [this.endsAt];
  }

  *makeMoves(): EntityGenerator {
    let isBuilderMove = false;

    while (true) {
      const { cardIndex, coords, rotation, meeple } = yield* this.waitForPlayerSocketEvent(
        GameClientEventType.ATTACH_CARD,
        {
          playerIndex: this.activePlayerIndex,
        },
      );

      const attachedToBuilder = this.game.attachPlayerCard({
        cardIndex,
        coords,
        rotation,
        meeple,
        playerIndex: this.activePlayerIndex,
        isFirstTurnCard: !isBuilderMove,
      });

      this.placedAnyCards = true;

      if (isBuilderMove || !attachedToBuilder || !this.game.canPlayAnyCards(this.activePlayerIndex)) {
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
