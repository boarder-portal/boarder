import { EGame, TGameClientEvent, TGameClientEventData, TGameOptions } from 'common/types/game';

import Game from 'server/gamesData/Game/Game';

export interface IEntityContext<G extends EGame> {
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

export type TGenerator<Result = void, Yield = never, EffectResult = unknown> = Generator<
  TEffectCallback<EffectResult>,
  Result,
  Yield
>;

export type TEffectGenerator<Result> = TGenerator<Result, Result, Result>;

export type TGeneratorReturnValue<Generator> = Generator extends TGenerator<infer Result> ? Result : never;

type TGeneratorPrevResult<Next> =
  | {
      type: 'success';
      value: Next;
    }
  | {
      type: 'error';
      error: unknown;
    };

type TAbortCallback = () => unknown;

type TCancelTask = (() => void) | undefined;

type TAllEffectReturnValue<T extends TGenerator<unknown>[]> = {
  [P in keyof T]: TGeneratorReturnValue<T[number]>;
};

export interface IWaitForSocketEventOptions<Game extends EGame, Event extends TGameClientEvent<Game>> {
  validate?(data: unknown): asserts data is TGameClientEventData<Game, Event>;
}

export interface IWaitForSocketEventResult<Game extends EGame, Event extends TGameClientEvent<Game>> {
  data: TGameClientEventData<Game, Event>;
  playerIndex: number;
}

export interface IWaitForPlayerSocketEventOptions<Game extends EGame, Event extends TGameClientEvent<Game>>
  extends IWaitForSocketEventOptions<Game, Event> {
  playerIndex: number;
  validate?(data: unknown): asserts data is TGameClientEventData<Game, Event>;
}

export interface ITrigger<Value = void> {
  (value: Value): void;
  [Symbol.iterator](): TEffectGenerator<Value>;
}

export default abstract class Entity<Game extends EGame, Result = unknown> {
  #children = new Set<Entity<Game>>();
  #lifecycle: Promise<Result> | null = null;
  #parent: Entity<Game> | null = null;
  #abortCallbacks = new Set<TAbortCallback>();
  spawned = false;
  context: IEntityContext<Game>;
  options: TGameOptions<Game>;

  constructor(parentOrContext: IEntityContext<Game> | Entity<Game>) {
    const context = parentOrContext instanceof Entity ? parentOrContext.context : parentOrContext;

    this.context = context;
    this.options = context.game.options;
  }

  protected abstract lifecycle(): TGenerator<Result>;

  #addAbortCallback(abortCallback: TAbortCallback): () => void {
    this.#abortCallbacks.add(abortCallback);

    return () => {
      this.#abortCallbacks.delete(abortCallback);
    };
  }

  #getGeneratorResult<Result>(generator: TGenerator<Result>): IGeneratorResult<Result> {
    let cancel: TCancelTask;

    return {
      run: async () => {
        let prevResult: TGeneratorPrevResult<never> = {
          type: 'success',
          value: undefined as never,
        };

        while (true) {
          const { value, done } =
            prevResult.type === 'success' ? generator.next(prevResult.value) : generator.throw(prevResult.error);

          if (done) {
            return value;
          }

          const effectResult: IEffectResult<unknown> = this.#handleAnyEffect(value);

          cancel = effectResult.cancel;

          try {
            prevResult = {
              type: 'success',
              value: (await effectResult.promise) as never,
            };
          } catch (err) {
            prevResult = {
              type: 'error',
              error: err,
            };
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
    let unregisterEffect: TCancelTask;

    return {
      cancel: () => unregisterEffect?.(),
      promise: new Promise<Result>((resolve, reject) => {
        const cleanup = callback(
          (result) => {
            unregisterEffect?.();
            resolve(result);
          },
          (error) => {
            unregisterEffect?.();
            reject(error);
          },
        );

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

  *afterLifecycle(): TGenerator {
    // empty
  }

  *all<T extends TGenerator<unknown>[]>(generators: T): TEffectGenerator<TAllEffectReturnValue<T>> {
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

        return cancel;
      });

      return () => {
        cancels.forEach((cancel) => {
          cancel();
        });
      };
    };
  }

  *beforeLifecycle(): TGenerator {
    // empty
  }

  *async<Result>(callback: TEffectCallback<Result>): TEffectGenerator<Result> {
    return yield callback;
  }

  createTrigger<Value = void>(): ITrigger<Value> {
    const callbacks = new Set<(value: Value) => unknown>();
    const trigger = ((value) => {
      for (const callback of callbacks) {
        callback(value);
      }
    }) as ITrigger<Value>;

    trigger[Symbol.iterator] = function* () {
      return yield (resolve) => {
        callbacks.add(resolve);

        return () => {
          callbacks.delete(resolve);
        };
      };
    };

    return trigger;
  }

  *delay(ms: number): TEffectGenerator<void> {
    yield (resolve) => {
      const timeout = setTimeout(resolve, ms);

      return () => {
        clearTimeout(timeout);
      };
    };
  }

  *eternity(): TEffectGenerator<void> {
    yield () => {
      // empty
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

  *race<T extends TGenerator<unknown>[]>(generators: T): TEffectGenerator<TGeneratorReturnValue<T[number]>> {
    return yield (resolve, reject) => {
      const cancels = generators.map((generator) => {
        const { run, cancel } = this.#getGeneratorResult(generator);

        run().then(resolve as any, reject);

        return cancel;
      });

      return () => {
        cancels.forEach((cancel) => {
          cancel();
        });
      };
    };
  }

  *repeatTask<Result = void>(ms: number, task: (this: this) => TGenerator<Result | void>): TEffectGenerator<Result> {
    return yield (resolve, reject) => {
      let promiseChain = Promise.resolve();
      let cancelTask: TCancelTask;

      const interval = setInterval(() => {
        promiseChain = promiseChain.then(async () => {
          try {
            const { run, cancel } = this.#getGeneratorResult(task.call(this));

            cancelTask = cancel;

            const result = await run();

            cancelTask = undefined;

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
        cancelTask?.();
      };
    };
  }

  async run(): Promise<Result> {
    if (this.#lifecycle) {
      return this.#lifecycle;
    }

    if (!this.spawned) {
      throw new Error('You need to spawn the entity first');
    }

    return (this.#lifecycle = (async () => {
      let cancelGenerator: TCancelTask;

      try {
        const beforeLifecycleGenerator = this.#getGeneratorResult(this.beforeLifecycle());

        cancelGenerator = beforeLifecycleGenerator.cancel;

        await beforeLifecycleGenerator.run();

        const lifecycleGenerator = this.#getGeneratorResult(this.lifecycle());

        cancelGenerator = lifecycleGenerator.cancel;

        const result = await lifecycleGenerator.run();

        const afterLifecycleGenerator = this.#getGeneratorResult(this.afterLifecycle());

        cancelGenerator = afterLifecycleGenerator.cancel;

        await afterLifecycleGenerator.run();

        cancelGenerator = undefined;

        return result;
      } finally {
        cancelGenerator?.();

        this.destroy();
      }
    })());
  }

  spawnEntity<E extends Entity<Game>>(entity: E): E {
    entity.spawned = true;
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

  spawnTask<Result>(action: TGenerator<Result>): TGenerator<Result> {
    const { run } = this.#getGeneratorResult(action);
    const promise = run();

    promise.catch(() => {
      // empty
    });

    return (function* (): TEffectGenerator<Result> {
      return yield (resolve, reject) => {
        promise.then(resolve, reject);
      };
    })();
  }

  *[Symbol.iterator](): TEffectGenerator<Result> {
    return yield (resolve, reject) => {
      this.run().then(resolve, reject);
    };
  }

  toJSON(): unknown {
    return null;
  }
}
