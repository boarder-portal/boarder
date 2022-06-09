import { EGame } from 'common/types/game';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TParentOrContext } from 'server/gamesData/Game/utilities/Entity';

export interface ITurnGameEntityOptions {
  activePlayerIndex?: number;
}

export default abstract class TurnGameEntity<Game extends EGame> extends GameEntity<Game> {
  activePlayerIndex: number;

  constructor(parentOrContext: TParentOrContext<Game>, options?: ITurnGameEntityOptions) {
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
