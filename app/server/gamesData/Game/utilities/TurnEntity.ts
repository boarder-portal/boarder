import { EGame } from 'common/types/game';

import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { TParentOrContext } from 'server/gamesData/Game/utilities/Entity';

export interface ITurnEntityOptions {
  activePlayerIndex?: number;
}

export default abstract class TurnEntity<Game extends EGame, Result = unknown> extends ServerEntity<Game, Result> {
  activePlayerIndex: number;

  constructor(parentOrContext: TParentOrContext<Game>, options?: ITurnEntityOptions) {
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
