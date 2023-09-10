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

  getNextPlayerIndex(): number {
    return (this.activePlayerIndex + 1) % this.playersCount;
  }

  passTurn(): void {
    this.activePlayerIndex = this.getNextPlayerIndex();
  }
}
