import { EGame } from 'common/types/game';
import { EGameClientEvent, ITurn } from 'common/types/carcassonne';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { now } from 'server/utilities/time';

import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';

export interface ITurnOptions {
  activePlayerIndex: number;
  duration: number;
}

export default class Turn extends ServerEntity<EGame.CARCASSONNE, boolean> {
  game: CarcassonneGame;

  activePlayerIndex: number;
  endsAt: number;
  placedAnyCards = false;

  constructor(game: CarcassonneGame, options: ITurnOptions) {
    super(game);

    this.game = game;
    this.activePlayerIndex = options.activePlayerIndex;
    this.endsAt = now() + options.duration;
  }

  *lifecycle(): TGenerator<boolean> {
    yield* this.race([
      // this.delay(this.endsAt - now()),
      this.makeMoves(),
    ]);

    return this.placedAnyCards;
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
