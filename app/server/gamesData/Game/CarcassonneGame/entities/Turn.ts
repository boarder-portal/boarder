import { EGame } from 'common/types/game';
import { EGameClientEvent, ITurn } from 'common/types/carcassonne';
import { ITimestamp } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import Timestamp from 'common/utilities/Timestamp';

import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';

export interface ITurnOptions {
  activePlayerIndex: number;
  duration: number;
}

export default class Turn extends ServerEntity<EGame.CARCASSONNE, boolean> {
  game: CarcassonneGame;

  activePlayerIndex: number;
  endsAt: Timestamp;
  placedAnyCards = false;

  constructor(game: CarcassonneGame, options: ITurnOptions) {
    super(game);

    this.game = game;
    this.activePlayerIndex = options.activePlayerIndex;
    this.endsAt = this.createTimestamp(options.duration);
  }

  *lifecycle(): TGenerator<boolean> {
    yield* this.race([
      // TODO: when uncomment add isPauseSupported(): true in CarcassonneGame
      // this.waitForTimestamp(this.endsAt),
      this.makeMoves(),
    ]);

    return this.placedAnyCards;
  }

  getCurrentTimestamps(): (ITimestamp | null | undefined)[] {
    return [this.endsAt];
  }

  *makeMoves(): TGenerator {
    let isBuilderMove = false;

    while (true) {
      const { cardIndex, coords, rotation, meeple } = yield* this.waitForPlayerSocketEvent(
        EGameClientEvent.ATTACH_CARD,
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

  toJSON(): ITurn {
    return {
      endsAt: this.endsAt,
    };
  }
}
