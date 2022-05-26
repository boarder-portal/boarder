import { EGame, TGameClientEvent, TGameClientEventData } from 'common/types/game';

import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { TGenerator, TParentOrContext } from 'server/gamesData/Game/utilities/Entity';

export interface IPlayerOptions {
  index: number;
}

export default abstract class PlayerEntity<Game extends EGame, Result = unknown> extends ServerEntity<Game, Result> {
  index: number;

  constructor(parentOrContext: TParentOrContext<Game>, options: IPlayerOptions) {
    super(parentOrContext);

    this.index = options.index;
  }

  *listenForOwnEvent<Event extends TGameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: TGameClientEventData<Game, Event>) => Result | void,
  ): TGenerator<Result> {
    return yield* this.listenForPlayerEvent(event, callback, { playerIndex: this.index });
  }
}
