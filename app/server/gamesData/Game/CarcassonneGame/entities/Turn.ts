import { EGame } from 'common/types/game';
import { EGameEvent, ITurn } from 'common/types/carcassonne';

import Entity, { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/entities/CarcassonneGame';

export interface ITurnOptions {
  activePlayerIndex: number;
  duration: number;
}

export default class Turn extends Entity<EGame.CARCASSONNE, boolean> {
  game: CarcassonneGame;

  activePlayerIndex: number;
  endsAt: number;
  placedAnyCards = false;

  constructor(game: CarcassonneGame, options: ITurnOptions) {
    super(game);

    this.game = game;
    this.activePlayerIndex = options.activePlayerIndex;
    this.endsAt = Date.now() + options.duration;
  }

  *lifecycle() {
    yield* this.race([
      // this.delay(this.endsAt - Date.now()),
      this.makeMoves(),
    ]);

    return this.placedAnyCards;
  }

  *makeMoves(): TGenerator {
    let isBuilderMove = false;

    while (true) {
      const { cardIndex, coords, rotation, meeple } = yield* this.waitForPlayerSocketEvent(EGameEvent.ATTACH_CARD, {
        playerIndex: this.activePlayerIndex,
      });

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
