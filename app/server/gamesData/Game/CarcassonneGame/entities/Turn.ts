import { EGame } from 'common/types/game';
import { EGameEvent, IPlayer, ITurn } from 'common/types/carcassonne';

import GameEntity, { TGenerator } from 'server/gamesData/Game/utilities/GameEntity';

import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/entities/CarcassonneGame';

export interface ITurnOptions {
  activePlayer: IPlayer;
  duration: number;
}

export default class Turn extends GameEntity<EGame.CARCASSONNE, boolean> {
  game: CarcassonneGame;

  activePlayer: IPlayer;
  endsAt: number;
  placedAnyCards = false;

  constructor(game: CarcassonneGame, options: ITurnOptions) {
    super();

    this.game = game;
    this.activePlayer = options.activePlayer;
    this.endsAt = Date.now() + options.duration;
  }

  *lifecycle() {
    yield* this.race([
      // this.delay(this.endsAt - Date.now()),
      this.makeMoves(),
    ]);

    return this.placedAnyCards;
  }

  *makeMoves(): TGenerator<EGame.CARCASSONNE> {
    let isBuilderMove = false;

    while (true) {
      const { cardIndex, coords, rotation, meeple } = yield* this.waitForPlayerSocketEvent(EGameEvent.ATTACH_CARD, {
        player: this.activePlayer.login,
      });

      const attachedToBuilder = this.game.attachPlayerCard({
        cardIndex,
        coords,
        rotation,
        meeple,
        player: this.activePlayer,
        isFirstTurnCard: !isBuilderMove,
      });

      this.placedAnyCards = true;

      if (isBuilderMove || !attachedToBuilder) {
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
