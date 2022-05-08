import mapValues from 'lodash/mapValues';
import { Socket } from 'socket.io';

import { EGame, TGameEvent, TGameEventData } from 'common/types/game';

import { TPlayerEventListeners } from 'server/gamesData/Game/Game';

export interface IStateContext<Game extends EGame> {
  listen(events: TPlayerEventListeners<Game>, player?: string | null): () => void;
  send<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void;
}

export interface IListenInfo<Game extends EGame> {
  events: TPlayerEventListeners<Game>;
  stopIf?(): boolean;
}

export default abstract class GameEntity<Game extends EGame, ReturnValue = void> {
  context: IStateContext<Game> | null = null;

  abstract lifecycle(): Promise<ReturnValue>;

  getContext(): IStateContext<Game> {
    if (!this.context) {
      throw new Error('No context');
    }

    return this.context;
  }

  async listen(listenInfo: IListenInfo<Game>, player?: string | null): Promise<void> {
    let unsubscribe: (() => void) | undefined;

    try {
      await new Promise<void>((resolve) => {
        unsubscribe = this.getContext().listen(
          mapValues(listenInfo.events, (handler) => {
            return (data, player) => {
              handler?.(data, player);

              if (listenInfo.stopIf?.() ?? true) {
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

  send<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void {
    this.getContext().send(event, data, socket);
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
