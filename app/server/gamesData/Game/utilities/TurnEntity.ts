import { GameType } from 'common/types/game';

import { ParentOrContext } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

export interface TurnEntityOptions {
  activePlayerIndex?: number;
}

export default abstract class TurnEntity<Game extends GameType, Result = unknown> extends ServerEntity<Game, Result> {
  activePlayerIndex: number;

  protected constructor(parentOrContext: ParentOrContext<Game>, options?: TurnEntityOptions) {
    super(parentOrContext);

    this.activePlayerIndex = options?.activePlayerIndex ?? 0;
  }

  getNextPlayerIndex(playerIndex = this.activePlayerIndex): number {
    return (playerIndex + 1) % this.playersCount;
  }

  passTurn(): void {
    this.activePlayerIndex = this.getNextPlayerIndex();
  }
}
