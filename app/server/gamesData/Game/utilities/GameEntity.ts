import mapValues from 'lodash/mapValues';
import { Socket } from 'socket.io';

import { EGame, TGameEvent, TGameEventData, TGamePlayer } from 'common/types/game';

import { TPlayerEventListeners } from 'server/gamesData/Game/Game';

interface IEntityContext<Game extends EGame> {
  listen(events: TPlayerEventListeners<Game>, player?: string | null): () => void;
  sendSocketEvent<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void;
}

type TUnsubscriber = () => unknown;

export interface IWaitForSocketEventOptions<Game extends EGame, Event extends TGameEvent<Game>> {
  validate?(data: unknown): asserts data is TGameEventData<Game, Event>;
}

export interface IWaitForSocketEventResult<Game extends EGame, Event extends TGameEvent<Game>> {
  data: TGameEventData<Game, Event>;
  player: TGamePlayer<Game>;
}

export interface IWaitForPlayerSocketEventOptions<Game extends EGame, Event extends TGameEvent<Game>> extends IWaitForSocketEventOptions<Game, Event> {
  player: string;
  validate?(data: unknown): asserts data is TGameEventData<Game, Event>;
}

interface ICancelablePromise<T> extends Promise<T> {
  cancel(): void;
}

export default abstract class GameEntity<Game extends EGame, Result = unknown> {
  #children = new Set<GameEntity<Game>>();
  #lifecycle: Promise<Result> | null = null;
  #parent: GameEntity<Game> | null = null;
  #unsubscribers = new Set<TUnsubscriber>();
  context: IEntityContext<Game> | null = null;

  protected abstract lifecycle(): Promise<Result>;

  #addUnsubscriber(unsubscriber: TUnsubscriber): () => void {
    this.#unsubscribers.add(unsubscriber);

    return () => {
      this.#unsubscribers.delete(unsubscriber);
    };
  }

  #destroy(): void {
    for (const child of this.#children) {
      child.#destroy();
    }

    for (const unsubscriber of this.#unsubscribers) {
      unsubscriber();
    }
  }

  #getContext(): IEntityContext<Game> {
    if (!this.context) {
      throw new Error('No context');
    }

    return this.context;
  }

  #registerEffect<Result>(
    callback: (
      resolve: (result: Result) => void,
      reject: (error: unknown) => void,
    ) => (() => unknown) | void,
  ): ICancelablePromise<Result> {
    let unregisterEffect: (() => unknown) | undefined;

    const cancelablePromise = new Promise((resolve, reject) => {
      const cleanup = callback((result) => {
        unregisterEffect?.();
        resolve(result);
      }, (error) => {
        unregisterEffect?.();
        reject(error);
      });

      const removeUnsubscriber = this.#addUnsubscriber(() => {
        cleanup?.();
        reject(new Error('Effect aborted'));
      });

      unregisterEffect = () => {
        cleanup?.();
        removeUnsubscriber();

        unregisterEffect = undefined;
      };
    }).finally(() => unregisterEffect?.()) as ICancelablePromise<Result>;

    cancelablePromise.cancel = () => {
      unregisterEffect?.();
    };

    return cancelablePromise;
  }

  delay(ms: number): ICancelablePromise<void> {
    return this.#registerEffect((resolve) => {
      const timeout = setTimeout(resolve, ms);

      return () => {
        clearTimeout(timeout);
      };
    });
  }

  listenSocketWhile(check: () => boolean, events: TPlayerEventListeners<Game>, player?: string | null): ICancelablePromise<void> {
    return this.#registerEffect((resolve, reject) => {
      if (!check()) {
        Promise.resolve().then(resolve);

        return;
      }

      return this.#getContext().listen(
        mapValues(events, (handler) => {
          return (data, player) => {
            try {
              handler?.(data, player);

              if (!check()) {
                resolve();
              }
            } catch (err) {
              reject(err);
            }
          };
        }),
        player,
      );
    });
  }

  async race<T extends readonly ICancelablePromise<unknown>[] | []>(effects: T): Promise<Awaited<T[number]>> {
    const result = await Promise.race(effects);

    effects.forEach((effect) => {
      effect.cancel();
    });

    return result;
  }

  repeatTask<Result>(ms: number, task: () => Result | void): ICancelablePromise<Result> {
    return this.#registerEffect((resolve, reject) => {
      let promiseChain = Promise.resolve();

      const interval = setInterval(() => {
        promiseChain = promiseChain.then(async () => {
          try {
            const result = await task();

            if (result !== undefined) {
              clearInterval(interval);

              resolve(result);
            }
          } catch (err) {
            reject(err);
          }
        });
      }, ms);

      return () => {
        clearInterval(interval);
      };
    });
  }

  async run(): Promise<Result> {
    if (this.#lifecycle) {
      return this.#lifecycle;
    }

    return (
      this.#lifecycle = (async () => {
        try {
          return await this.lifecycle();
        } finally {
          this.#destroy();
        }
      })()
    );
  }

  sendSocketEvent<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void {
    this.#getContext().sendSocketEvent(event, data, socket);
  }

  spawnEntity<Entity extends GameEntity<Game>>(entity: Entity): Entity {
    entity.context = this.context;
    entity.#parent = this;

    this.#children.add(entity);

    (async () => {
      try {
        await entity.run();
      } catch {
        // empty
      } finally {
        this.#children.delete(entity);
      }
    })();

    return entity;
  }

  toJSON(): unknown {
    return null;
  }

  waitForEntity<Result>(entity: GameEntity<Game, Result>): ICancelablePromise<Result> {
    return this.#registerEffect((resolve, reject) => {
      entity.run().then(resolve, reject);
    });
  }

  waitForPlayerSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    options: IWaitForPlayerSocketEventOptions<Game, Event>,
  ): ICancelablePromise<TGameEventData<Game, Event>> {
    return this.#registerEffect((resolve) => {
      return this.#getContext().listen({
        [event]: (data: unknown) => {
          try {
            if (options.validate?.(data) ?? true) {
              resolve(data);
            }
          } catch {
            // empty
          }
        },
      } as any, options.player);
    });
  }

  waitForSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    options?: IWaitForSocketEventOptions<Game, Event>,
  ): ICancelablePromise<IWaitForSocketEventResult<Game, Event>> {
    return this.#registerEffect((resolve) => {
      return this.#getContext().listen({
        [event]: (data: unknown, player: TGamePlayer<Game>) => {
          try {
            if (options?.validate?.(data) ?? true) {
              resolve({
                data,
                player,
              });
            }
          } catch {
            // empty
          }
        },
      } as any);
    });
  }
}
