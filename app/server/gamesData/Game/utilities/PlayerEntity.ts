import { GameClientEvent, GameClientEventData, GameType } from 'common/types/game';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import { ParentGameEntity } from 'server/gamesData/Game/utilities/AbstractGameEntity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

export interface PlayerOptions {
  index: number;
}

export default abstract class PlayerEntity<Game extends GameType, Result = unknown> extends ServerEntity<Game, Result> {
  index: number;

  protected constructor(parent: ParentGameEntity<Game>, options: PlayerOptions) {
    super(parent);

    this.index = options.index;
  }

  *listenForOwnEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: GameClientEventData<Game, Event>) => Result | void,
  ): EntityGenerator<Result> {
    return yield* this.listenForPlayerEvent(event, callback, { playerIndex: this.index });
  }
}
