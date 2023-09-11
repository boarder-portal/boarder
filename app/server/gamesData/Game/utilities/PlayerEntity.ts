import { GameClientEvent, GameClientEventData, GameType } from 'common/types/game';

import { EntityGenerator, ParentOrContext } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

export interface PlayerOptions {
  index: number;
}

export default abstract class PlayerEntity<Game extends GameType, Result = unknown> extends ServerEntity<Game, Result> {
  index: number;

  protected constructor(parentOrContext: ParentOrContext<Game>, options: PlayerOptions) {
    super(parentOrContext);

    this.index = options.index;
  }

  *listenForOwnEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: GameClientEventData<Game, Event>) => Result | void,
  ): EntityGenerator<Result> {
    return yield* this.listenForPlayerEvent(event, callback, { playerIndex: this.index });
  }
}
