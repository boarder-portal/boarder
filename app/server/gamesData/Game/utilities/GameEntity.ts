import mapValues from 'lodash/mapValues';
import { Socket } from 'socket.io';

import { EGame, TGameEvent, TGameEventData } from 'common/types/game';

import { TPlayerEventListeners } from 'server/gamesData/Game/Game';

export interface IEntityContext<Game extends EGame> {
  listen(events: TPlayerEventListeners<Game>, player?: string | null): () => void;
  sendSocketEvent<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void;
}

export default abstract class GameEntity<Game extends EGame, ReturnValue = void> {
  context: IEntityContext<Game> | null = null;

  abstract lifecycle(): Promise<ReturnValue>;

  getContext(): IEntityContext<Game> {
    if (!this.context) {
      throw new Error('No context');
    }

    return this.context;
  }

  async listenWhile(check: () => boolean, events: TPlayerEventListeners<Game>, player?: string | null): Promise<void> {
    let unsubscribe: (() => void) | undefined;

    try {
      await new Promise<void>((resolve) => {
        unsubscribe = this.getContext().listen(
          mapValues(events, (handler) => {
            return (data, player) => {
              handler?.(data, player);

              if (check()) {
                resolve();
              }
            };
          }),
          player,
        );
      });
    } finally {
      unsubscribe?.();
    }
  }

  sendSocketEvent<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void {
    this.getContext().sendSocketEvent(event, data, socket);
  }

  async spawnState<ReturnValue>(state: GameEntity<Game, ReturnValue>): Promise<ReturnValue> {
    state.context = this.context;

    return state.lifecycle();
  }

  toJSON(): unknown {
    return null;
  }

  async waitFor<Event extends TGameEvent<Game>>(
    event: Event,
    player?: string | null,
  ): Promise<TGameEventData<Game, Event>> {
    let unsubscribe: (() => void) | undefined;

    try {
      return await new Promise<TGameEventData<Game, Event>>((resolve) => {
        unsubscribe = this.getContext().listen({
          [event]: resolve,
        } as any, player);
      });
    } finally {
      unsubscribe?.();
    }
  }
}
