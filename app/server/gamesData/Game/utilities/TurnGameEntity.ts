import { GameType } from 'common/types/game';

import { ParentOrContext } from 'server/gamesData/Game/utilities/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

export interface TurnGameEntityOptions {
  activePlayerIndex?: number;
}

export default abstract class TurnGameEntity<Game extends GameType> extends GameEntity<Game> {
  activePlayerIndex: number;

  constructor(parentOrContext: ParentOrContext<Game>, options?: TurnGameEntityOptions) {
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
