import { Socket } from 'socket.io';

import { EGame, TGameEvent, TGameEventData, TGamePlayer } from 'common/types/game';

import Game from 'server/gamesData/Game/Game';

interface IEntityContext<G extends EGame> {
  game: Game<G>;
}

interface IEffectResult<Result> {
  promise: Promise<Result>;
  cancel(): void;
}

interface IGeneratorResult<Result> {
  run(): Promise<Result>;
  cancel(): void;
}

export type TEffectCallback<Result> = (
  resolve: (result: Result) => void,
  reject: (error: unknown) => void,
) => (() => unknown) | void;

export type TGenerator<Result = void, Yield = never> = Generator<TEffectCallback<unknown>, Result, Yield>;

export type TGeneratorReturnValue<Generator> = Generator extends TGenerator<infer Result>
  ? Result
  : never;

type TAbortCallback = () => unknown;

type TAllEffectReturnValue<T extends TGenerator<unknown>[]> = {
  [P in keyof T]: TGeneratorReturnValue<T[number]>;
};

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

export default abstract class GameEntity<Game extends EGame, Result = unknown> {
  #children = new Set<GameEntity<Game>>();
  #lifecycle: Promise<Result> | null = null;
  #parent: GameEntity<Game> | null = null;
  #abortCallbacks = new Set<TAbortCallback>();
  #context: IEntityContext<Game> | null = null;

  protected abstract lifecycle(): TGenerator<Result>;

  #addAbortCallback(abortCallback: TAbortCallback): () => void {
    this.#abortCallbacks.add(abortCallback);

    return () => {
      this.#abortCallbacks.delete(abortCallback);
    };
  }

  #getContext(): IEntityContext<Game> {
    if (!this.#context) {
      throw new Error('No context. You need to spawn entities using spawnEntity');
    }

    return this.#context;
  }

  #getGeneratorResult<Result>(generator: TGenerator<Result>): IGeneratorResult<Result> {
    let cancel: (() => void) | undefined;

    return {
      run: async () => {
        let prevResult: unknown;

        while (true) {
          const { value, done } = generator.next(prevResult as never);

          if (done) {
            return value;
          }

          const effectResult = this.#handleAnyEffect(value);

          cancel = () => {
            effectResult?.cancel();
          };

          if (effectResult) {
            prevResult = await effectResult.promise;
          }

          cancel = undefined;
        }
      },
      cancel() {
        cancel?.();
      },
    };
  }

  #handleAnyEffect<Result>(callback: TEffectCallback<Result>): IEffectResult<Result> {
    let unregisterEffect: (() => void) | undefined;

    return {
      cancel: () => unregisterEffect?.(),
      promise: new Promise<Result>((resolve, reject) => {
        const cleanup = callback((result) => {
          unregisterEffect?.();
          resolve(result);
        }, (error) => {
          unregisterEffect?.();
          reject(error);
        });

        const removeUnsubscriber = this.#addAbortCallback(() => {
          cleanup?.();
          reject(new Error('Effect aborted'));
        });

        unregisterEffect = () => {
          cleanup?.();
          removeUnsubscriber();

          unregisterEffect = undefined;
        };
      }).finally(() => unregisterEffect?.()),
    };
  }

  *all<T extends TGenerator<unknown>[]>(generators: T): TGenerator<TAllEffectReturnValue<T>, TAllEffectReturnValue<T>> {
    return yield (resolve, reject) => {
      const results: unknown[] = generators.map(() => undefined);
      let resultsLeft = generators.length;

      const cancels = generators.map((generator, index) => {
        const { run, cancel } = this.#getGeneratorResult(generator);

        run().then((result) => {
          results[index] = result;

          resultsLeft--;

          if (!resultsLeft) {
            resolve(results as TAllEffectReturnValue<T>);
          }
        }, reject);

        return () => {
          cancel();
        };
      });

      return () => {
        cancels.forEach((cancel) => {
          cancel();
        });
      };
    };
  }

  *async<Result>(callback: TEffectCallback<Result>): TGenerator<Result, Result> {
    return yield callback;
  }

  *delay(ms: number): TGenerator<void, void> {
    yield (resolve) => {
      const timeout = setTimeout(resolve, ms);

      return () => {
        clearTimeout(timeout);
      };
    };
  }

  destroy(): void {
    for (const child of this.#children) {
      child.destroy();
    }

    for (const unsubscriber of this.#abortCallbacks) {
      unsubscriber();
    }
  }

  *race<T extends TGenerator<unknown>[]>(generators: T): TGenerator<TGeneratorReturnValue<T[number]>, TGeneratorReturnValue<T[number]>> {
    return yield (resolve, reject) => {
      const cancels = generators.map((generator) => {
        const { run, cancel } = this.#getGeneratorResult(generator);

        run().then(resolve as any, reject);

        return () => {
          cancel();
        };
      });

      return () => {
        cancels.forEach((cancel) => {
          cancel();
        });
      };
    };
  }

  *repeatTask<Result = void>(ms: number, task: () => Result | Promise<Result>): TGenerator<Result, Result> {
    return yield (resolve, reject) => {
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
    };
  }

  async run(): Promise<Result> {
    if (this.#lifecycle) {
      return this.#lifecycle;
    }

    return (
      this.#lifecycle = (async () => {
        let cancelGenerator: (() => void) | undefined;

        try {
          const { run, cancel } = this.#getGeneratorResult(this.lifecycle());

          cancelGenerator = cancel;

          return await run();
        } finally {
          cancelGenerator?.();

          this.destroy();
        }
      })()
    );
  }

  sendSocketEvent<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void {
    this.#getContext().game.sendSocketEvent(event, data, socket);
  }

  spawnEntity<Entity extends GameEntity<Game>>(entity: Entity): Entity {
    entity.#context = this.#context;
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

  *[Symbol.iterator](): TGenerator<Result, Result> {
    return yield (resolve, reject) => {
      this.run().then(resolve, reject);
    };
  }

  toJSON(): unknown {
    return null;
  }

  *waitForPlayerSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    options: IWaitForPlayerSocketEventOptions<Game, Event>,
  ): TGenerator<TGameEventData<Game, Event>, TGameEventData<Game, Event>> {
    return yield (resolve) => {
      return this.#getContext().game.listenSocketEvent(event, (data) => {
        try {
          if (options?.validate?.(data) ?? true) {
            resolve(data);
          }
        } catch {
          // empty
        }
      }, options.player);
    };
  }

  *waitForSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    options?: IWaitForSocketEventOptions<Game, Event>,
  ): TGenerator<IWaitForSocketEventResult<Game, Event>, IWaitForSocketEventResult<Game, Event>> {
    return yield (resolve) => {
      this.#getContext().game.listenSocketEvent(event, (data, player) => {
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
      });
    };
  }
}
