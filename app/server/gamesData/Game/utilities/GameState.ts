import mapValues from 'lodash/mapValues';
import { Socket } from 'socket.io';

import { EGame, TGameEvent, TGameEventData } from 'common/types/game';

import { TPlayerEventListeners } from 'server/gamesData/Game/Game';

export interface IStateContext<Game extends EGame> {
  listen(events: TPlayerEventListeners<Game>, player?: string | null): () => void;
  send<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void;
}

export interface IListenInfo<Game extends EGame, RootState> {
  events: TPlayerEventListeners<Game>;
  stopIf?(): boolean;
}

export default abstract class GameState<Game extends EGame, RootState, ReturnValue = void> {
  context: IStateContext<Game> | null = null;
  rootState: RootState | null;

  protected constructor(rootState: RootState | null = null) {
    this.rootState = rootState;
  }

  abstract lifecycle(): Promise<ReturnValue>;

  getContext(): IStateContext<Game> {
    if (!this.context) {
      throw new Error('No context');
    }

    return this.context;
  }

  getRootState(): RootState {
    if (!this.rootState) {
      throw new Error('No root state');
    }

    return this.rootState;
  }

  async listen(listenInfo: IListenInfo<Game, RootState>, player?: string | null): Promise<void> {
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

  async spawnState<ReturnValue>(state: GameState<Game, RootState, ReturnValue>): Promise<ReturnValue> {
    state.context = this.context;
    state.rootState = this.rootState;

    return state.lifecycle();
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
