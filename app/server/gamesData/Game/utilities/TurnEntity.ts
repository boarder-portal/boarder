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

  getNextActivePlayerIndex(): number {
    const startPlayerIndex = this.getNextPlayerIndex(this.activePlayerIndex);
    let nextPlayerIndex = startPlayerIndex;

    while (!this.isPlayerInPlay(nextPlayerIndex)) {
      nextPlayerIndex = this.getNextPlayerIndex(nextPlayerIndex);

      if (nextPlayerIndex === startPlayerIndex) {
        return -1;
      }
    }

    return nextPlayerIndex;
  }

  getNextPlayerIndex(playerIndex = this.activePlayerIndex): number {
    return super.getNextPlayerIndex(playerIndex);
  }

  hasActivePlayer(): boolean {
    return this.activePlayerIndex !== -1;
  }

  isPlayerInPlay(playerIndex: number): boolean {
    return true;
  }

  passTurn(): void {
    this.activePlayerIndex = this.getNextActivePlayerIndex();
  }
}
