import mapValues from 'lodash/mapValues';
import { Socket } from 'socket.io';

import { EGame, TGameEvent, TGameEventData } from 'common/types/game';

import { TPlayerEventListeners } from 'server/gamesData/Game/Game';

interface IEntityContext<Game extends EGame> {
  listen(events: TPlayerEventListeners<Game>, player?: string | null): () => void;
  sendSocketEvent<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void;
}

enum EEffect {
  AWAIT_ENTITY = 'AWAIT_ENTITY',
  DELAY = 'DELAY',
  REPEAT_TASK = 'REPEAT_TASK',
  LISTEN_SOCKET = 'LISTEN_SOCKET',
  WAIT_SOCKET_EVENT = 'WAIT_SOCKET_EVENT',
}

interface IAwaitEntityEffect<Game extends EGame, Result> {
  type: EEffect.AWAIT_ENTITY;
  entity: GameEntity<Game, Result>;
}

interface IDelayEffect {
  type: EEffect.DELAY;
  ms: number;
}

interface IRepeatTaskEffect<Result> {
  type: EEffect.REPEAT_TASK;
  ms: number;
  task(): Result | void;
}

interface IListenSocketEffect<Game extends EGame> {
  type: EEffect.LISTEN_SOCKET;
  check(): boolean;
  events: TPlayerEventListeners<Game>;
  player?: string | null;
}

interface IWaitSocketEventEffect<Game extends EGame, Event extends TGameEvent<Game>> {
  type: EEffect.WAIT_SOCKET_EVENT;
  event: Event;
  player?: string | null;
}

type TEffect<Game extends EGame> =
  | IAwaitEntityEffect<Game, unknown>
  | IDelayEffect
  | IRepeatTaskEffect<unknown>
  | IListenSocketEffect<Game>
  | IWaitSocketEventEffect<Game, TGameEvent<Game>>

type TGenerator<Game extends EGame, Result, Yield = unknown> = Generator<TEffect<Game>, Result, Yield>;

export type TLifecycle<Game extends EGame, Result = void> = TGenerator<Game, Result>;

type TUnsubscriber = () => unknown;

export default abstract class GameEntity<Game extends EGame, Result = unknown> {
  #children = new Set<GameEntity<Game>>();
  #lifecycle: Promise<Result> | null = null;
  #parent: GameEntity<Game> | null = null;
  #unsubscribers = new Set<TUnsubscriber>();
  context: IEntityContext<Game> | null = null;

  protected abstract lifecycle(): TLifecycle<Game, Result>;

  #addUnsubscriber(unsubscriber: TUnsubscriber): () => void {
    this.#unsubscribers.add(unsubscriber);

    return () => {
      this.#unsubscribers.delete(unsubscriber);
    };
  }

  #getContext(): IEntityContext<Game> {
    if (!this.context) {
      throw new Error('No context');
    }

    return this.context;
  }

  #handleAnyEffect<Result>(
    callback: (
      resolve: (result: Result) => void,
      reject: (error: unknown) => void,
    ) => (() => unknown) | void,
  ): Promise<Result> {
    return new Promise((resolve, reject) => {
      callback((result) => {
        cleanup();
        resolve(result);
      }, (error) => {
        cleanup();
        reject(error);
      });

      const cleanup = this.#addUnsubscriber(() => {
        reject(new Error('Effect aborted'));
      });
    });
  }

  #handleAwaitEntityEffect<Result>(effect: IAwaitEntityEffect<Game, Result>): Promise<Result> {
    return this.#handleAnyEffect((resolve, reject) => {
      (async () => {
        try {
          resolve(await effect.entity.#run());
        } catch (err) {
          reject(err);
        }
      })();
    });
  }

  #handleDelayEffect(effect: IDelayEffect): Promise<void> {
    return this.#handleAnyEffect((resolve) => {
      const timeout = setTimeout(resolve, effect.ms);

      return () => {
        clearTimeout(timeout);
      };
    });
  }

  async #handleEffect(effect: TEffect<Game>): Promise<unknown> {
    if (effect.type === EEffect.AWAIT_ENTITY) {
      return this.#handleAwaitEntityEffect(effect);
    }

    if (effect.type === EEffect.DELAY) {
      return this.#handleDelayEffect(effect);
    }

    if (effect.type === EEffect.REPEAT_TASK) {
      return this.#handleRepeatTaskEffect(effect);
    }

    if (effect.type === EEffect.LISTEN_SOCKET) {
      return this.#handleListenSocketEffect(effect);
    }

    if (effect.type === EEffect.WAIT_SOCKET_EVENT) {
      return this.#handleWaitSocketEffect(effect);
    }
  }

  #handleListenSocketEffect(effect: IListenSocketEffect<Game>): Promise<void> {
    return this.#handleAnyEffect((resolve) => {
      return this.#getContext().listen(
        mapValues(effect.events, (handler) => {
          return (data, player) => {
            handler?.(data, player);

            if (effect.check()) {
              resolve();
            }
          };
        }),
        effect.player,
      );
    });
  }

  #handleRepeatTaskEffect<Result>(effect: IRepeatTaskEffect<Result>): Promise<Result> {
    return this.#handleAnyEffect((done) => {
      const interval = setInterval(() => {
        const result = effect.task();

        if (result !== undefined) {
          clearInterval(interval);

          done(result);
        }
      }, effect.ms);

      return () => {
        clearInterval(interval);
      };
    });
  }

  #handleWaitSocketEffect<Event extends TGameEvent<Game>>(
    effect: IWaitSocketEventEffect<Game, Event>,
  ): Promise<TGameEventData<Game, Event>> {
    return this.#handleAnyEffect((resolve) => {
      return this.#getContext().listen({
        [effect.event]: resolve,
      } as any, effect.player);
    });
  }

  async #run(): Promise<Result> {
    if (this.#lifecycle) {
      return this.#lifecycle;
    }

    return (
      this.#lifecycle = (async () => {
        const iterator = this.lifecycle();
        let prevResult: unknown;

        while (true) {
          const { value, done } = iterator.next(prevResult);

          if (done) {
            return value;
          }

          prevResult = await this.#handleEffect(value);
        }
      })()
    );
  }

  *awaitEntity<Result>(entity: GameEntity<Game, Result>): TGenerator<Game, Result, Result> {
    return yield {
      type: EEffect.AWAIT_ENTITY,
      entity,
    };
  }

  *delay(ms: number): TGenerator<Game, void> {
    yield {
      type: EEffect.DELAY,
      ms,
    };
  }

  *listenSocketWhile(check: () => boolean, events: TPlayerEventListeners<Game>, player?: string | null): TGenerator<Game, void> {
    yield {
      type: EEffect.LISTEN_SOCKET,
      check,
      events,
      player,
    };
  }

  *repeatTask<Result>(ms: number, task: () => Result | void): TGenerator<Game, Result, Result> {
    return yield {
      type: EEffect.REPEAT_TASK,
      ms,
      task,
    };
  }

  async run(): Promise<Result> {
    return this.#run();
  }

  sendSocketEvent<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void {
    this.#getContext().sendSocketEvent(event, data, socket);
  }

  spawnEntity<Entity extends GameEntity<Game>>(entity: Entity): Entity {
    entity.context = this.context;
    entity.#parent = this;

    this.#children.add(entity);

    return entity;
  }

  toJSON(): unknown {
    return null;
  }

  *waitForSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    player?: string | null,
  ): TGenerator<Game, TGameEventData<Game, Event>> {
    return yield {
      type: EEffect.WAIT_SOCKET_EVENT,
      event,
      player,
    };
  }
}
