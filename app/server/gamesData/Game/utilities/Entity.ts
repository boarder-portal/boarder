import map from 'lodash/map';

import { EGame, TGameOptions } from 'common/types/game';
import { ITimestamp } from 'common/types';

import AbortError from 'server/gamesData/Game/utilities/AbortError';
import Timestamp from 'common/utilities/Timestamp';
import { now } from 'server/utilities/time';

import Game from 'server/gamesData/Game/Game';

export interface IEntityContext<G extends EGame> {
  game: Game<G>;
}

export type TParentOrContext<Game extends EGame> = IEntityContext<Game> | Entity<Game, any>;

interface IGeneratorResult<Result> {
  run(resolve: TResolve<Result>, reject: TReject): void;
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

export type TIterableOrGenerator<Result = void, Yield = never, EffectResult = unknown> =
  | TGenerator<Result, Yield, EffectResult>
  | {
      [Symbol.iterator](): TGenerator<Result, Yield, EffectResult>;
    };

export type TEffectGenerator<Result> = TGenerator<Result, Result, Result>;

export type TGeneratorReturnValue<Generator> = Generator extends TGenerator<infer Result>
  ? Result
  : Generator extends {
      [Symbol.iterator](): TGenerator<infer Result>;
    }
  ? Result
  : never;

type TEffectResult<Result> =
  | {
      type: 'success';
      value: Result;
    }
  | {
      type: 'error';
      error: unknown;
    };

type TAbortCallback = () => unknown;

type TCancelTask = (() => void) | undefined;

type TResolve<Result> = (result: Result) => unknown;

type TReject = (err: unknown) => unknown;

type TAllEffectReturnValue<T extends TIterableOrGenerator<unknown>[]> = {
  [P in keyof T]: TGeneratorReturnValue<T[P]>;
};

type IRaceObjectReturnValue<T> = {
  [P in keyof T]: {
    type: P;
    value: T extends Record<string, TIterableOrGenerator<unknown>> ? TGeneratorReturnValue<T[P]> : never;
  };
}[keyof T];

export interface ITrigger<Value = void> {
  (value: Value): void;
  [Symbol.iterator](): TEffectGenerator<Value>;
}

export default abstract class Entity<Game extends EGame, Result = unknown> {
  #children = new Set<Entity<Game>>();
  #parent: Entity<Game, any> | null = null;
  #abortCallbacks = new Set<TAbortCallback>();
  #successCallbacks = new Set<TResolve<Result>>();
  #errorCallbacks = new Set<TReject>();
  #timestamps = new Set<Timestamp>();
  #started = false;
  #destroyed = false;
  #result: TEffectResult<Result> | undefined;
  spawned = false;
  paused = false;
  context: IEntityContext<Game>;
  options: TGameOptions<Game>;

  constructor(parentOrContext: TParentOrContext<Game>) {
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

  #getAllTimestamps(): (ITimestamp | null | undefined)[] {
    return [...this.#timestamps, ...(this.getCurrentTimestamps?.() ?? [])];
  }

  #getGeneratorResult<Result>(generatorOrIterable: TIterableOrGenerator<Result>): IGeneratorResult<Result> {
    const generator: TGenerator<Result> = generatorOrIterable[Symbol.iterator]();
    let cancel: TCancelTask;

    return {
      run: (resolve, reject) => {
        let prevResult: TEffectResult<never> = {
          type: 'success',
          value: undefined as never,
        };

        const runIteration = () => {
          let iteratorResult: IteratorResult<TEffectCallback<unknown>, Result>;

          try {
            iteratorResult =
              prevResult.type === 'success' ? generator.next(prevResult.value) : generator.throw(prevResult.error);
          } catch (err) {
            return reject(err);
          }

          if (iteratorResult.done) {
            return resolve(iteratorResult.value);
          }

          const effectResult: IGeneratorResult<unknown> = this.#handleAnyEffect(iteratorResult.value);

          cancel = effectResult.cancel;

          effectResult.run(
            (result) => {
              prevResult = {
                type: 'success',
                value: result as never,
              };

              runIteration();
            },
            (error) => {
              prevResult = {
                type: 'error',
                error,
              };

              runIteration();
            },
          );
        };

        runIteration();
      },
      cancel() {
        cancel?.();
      },
    };
  }

  #handleAnyEffect<Result>(callback: TEffectCallback<Result>): IGeneratorResult<Result> {
    let unregisterEffect: TCancelTask;

    return {
      run: (resolve, reject) => {
        let resolvedOrRejected = false;
        let async = false;
        let syncResult: TEffectResult<Result> | undefined;

        const cleanup = callback(
          (result) => {
            if (resolvedOrRejected) {
              return;
            }

            resolvedOrRejected = true;

            if (async) {
              unregisterEffect?.();
              resolve(result);
            } else {
              syncResult = {
                type: 'success',
                value: result,
              };
            }
          },
          (error) => {
            if (resolvedOrRejected) {
              return;
            }

            resolvedOrRejected = true;

            if (async) {
              unregisterEffect?.();
              reject(error);
            } else {
              syncResult = {
                type: 'error',
                error,
              };
            }
          },
        );

        const removeUnsubscriber = this.#addAbortCallback(() => {
          cleanup?.();
          reject(new AbortError('Effect aborted'));
        });

        unregisterEffect = () => {
          cleanup?.();
          removeUnsubscriber();

          unregisterEffect = undefined;
        };

        if (syncResult?.type === 'success') {
          resolve(syncResult.value);
        } else if (syncResult?.type === 'error') {
          reject(syncResult.error);
        }

        async = true;
      },
      cancel: () => unregisterEffect?.(),
    };
  }

  *afterLifecycle(): TGenerator {
    // empty
  }

  afterPause(): void {
    // empty
  }

  afterUnpause(): void {
    // empty
  }

  *all<T extends TIterableOrGenerator<unknown>[]>(generators: T): TEffectGenerator<TAllEffectReturnValue<T>> {
    return yield (resolve, reject) => {
      const results: unknown[] = generators.map(() => undefined);
      let resultsLeft = generators.length;

      const cancels = generators.map((generator, index) => {
        const { run, cancel } = this.#getGeneratorResult(generator);

        run((result) => {
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

  *async<Result>(callback: TEffectCallback<Result>): TEffectGenerator<Result> {
    return yield callback;
  }

  *beforeLifecycle(): TGenerator {
    // empty
  }

  createTimestamp(addMs = 0): Timestamp {
    return new Timestamp({
      addMs,
      now,
    });
  }

  createTrigger<Value = void>(): ITrigger<Value> {
    const callbacks = new Set<(value: Value) => unknown>();
    const trigger = ((value) => {
      const startingCallbacks = new Set(callbacks);

      for (const callback of callbacks) {
        if (startingCallbacks.has(callback)) {
          callback(value);
        }
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
      const timestamp = this.createTimestamp(ms);
      const unsubscribe = timestamp.subscribe(resolve);

      this.#timestamps.add(timestamp);

      return () => {
        this.#timestamps.delete(timestamp);

        unsubscribe();
      };
    };
  }

  *eternity(): TEffectGenerator<void> {
    yield () => {
      // empty
    };
  }

  destroy(): void {
    this.#destroyed = true;

    for (const child of this.#children) {
      child.destroy();
    }

    for (const unsubscriber of this.#abortCallbacks) {
      unsubscriber();
    }
  }

  getCurrentTimestamps?(): (ITimestamp | null | undefined)[];

  pause(pausedAt: number): void {
    if (this.paused) {
      return;
    }

    this.paused = true;

    this.#getAllTimestamps().forEach((timestamp) => {
      timestamp?.pause?.(pausedAt);
    });

    for (const child of this.#children) {
      child.pause(pausedAt);
    }

    this.afterPause();
  }

  race<T extends TIterableOrGenerator<unknown>[]>(generators: T): TEffectGenerator<TGeneratorReturnValue<T[keyof T]>>;
  race<T extends Record<string, TIterableOrGenerator<unknown>>>(
    generators: T,
  ): TEffectGenerator<IRaceObjectReturnValue<T>>;
  *race<T extends TIterableOrGenerator<unknown>[] | Record<string, TIterableOrGenerator<unknown>>>(
    generators: T,
  ): TEffectGenerator<
    T extends TIterableOrGenerator<unknown>[] ? TGeneratorReturnValue<T[keyof T]> : IRaceObjectReturnValue<T>
  > {
    return yield (resolve, reject) => {
      const cancels = map(generators, (generator, key) => {
        const { run, cancel } = this.#getGeneratorResult(generator as any as TGenerator<Result>);

        run((result) => {
          resolve(Array.isArray(generators) ? result : ({ type: key, value: result } as any));
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

  *repeatTask<Result = void>(ms: number, task: (this: this) => TGenerator<Result | void>): TGenerator<Result> {
    let msToNextTask = ms;

    while (true) {
      yield* this.delay(msToNextTask);

      const timestamp = this.createTimestamp();
      const result = yield* task.call(this);

      if (result !== undefined) {
        return result;
      }

      msToNextTask = ms - timestamp.timePassed;
    }
  }

  run(resolve: TResolve<Result>, reject: TReject): () => void {
    const unsubscribe = () => {
      this.#successCallbacks.delete(resolve);
      this.#errorCallbacks.delete(reject);
    };

    if (this.#result) {
      if (this.#result.type === 'success') {
        resolve(this.#result.value);
      } else {
        reject(this.#result.error);
      }

      return unsubscribe;
    }

    this.#successCallbacks.add(resolve);
    this.#errorCallbacks.add(reject);

    if (this.#started) {
      return unsubscribe;
    }

    if (!this.spawned) {
      throw new Error('You need to spawn the entity first');
    }

    this.#started = true;

    ((resolve: TResolve<Result>, reject: TReject) => {
      this.#getGeneratorResult(this.beforeLifecycle()).run(() => {
        const runAfterLifecycle = (resolve: TResolve<void>, reject: TReject) => {
          this.#getGeneratorResult(this.afterLifecycle()).run(resolve, reject);
        };

        this.#getGeneratorResult(this.lifecycle()).run(
          (result) => {
            runAfterLifecycle(() => resolve(result), reject);
          },
          (err) => {
            runAfterLifecycle(() => reject(err), reject);
          },
        );
      }, reject);
    })(
      (result) => {
        this.#result = {
          type: 'success',
          value: result,
        };

        this.#successCallbacks.forEach((successCallback) => successCallback(result));
      },
      (err) => {
        this.#result = {
          type: 'error',
          error: err,
        };

        this.#errorCallbacks.forEach((errorCallback) => errorCallback(err));
      },
    );

    return unsubscribe;
  }

  // TODO: remove
  spawnEntity<E extends Entity<Game, any>>(entity: E): E {
    entity.spawned = true;
    entity.#parent = this;

    this.#children.add(entity);

    const removeFromChildren = () => {
      this.#children.delete(entity);
    };

    entity.run(removeFromChildren, removeFromChildren);

    return entity;
  }

  spawnTask<Result>(action: TGenerator<Result>): TGenerator<Result> {
    const { run } = this.#getGeneratorResult(action);

    let taskResult: TEffectResult<Result> | undefined;
    let taskResolve: TResolve<Result> | undefined;
    let taskReject: TReject | undefined;
    let async = false;

    run(
      (result) => {
        taskResult = {
          type: 'success',
          value: result,
        };

        taskResolve?.(result);
      },
      (error) => {
        taskResult = {
          type: 'error',
          error,
        };

        if (!async) {
          throw error;
        }

        if (taskReject) {
          taskReject(error);
        } else if (!this.#destroyed) {
          console.log('Unhandled spawnTask error', error);
        }
      },
    );

    async = true;

    return (function* (): TEffectGenerator<Result> {
      return yield (resolve, reject) => {
        if (taskResult?.type === 'success') {
          resolve(taskResult.value);
        } else if (taskResult?.type === 'error') {
          reject(taskResult.error);
        } else {
          taskResolve = resolve;
          taskReject = reject;
        }
      };
    })();
  }

  *[Symbol.iterator](): TEffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.run(resolve, reject);
    };
  }

  toJSON(): unknown {
    return null;
  }

  unpause(unpausedAt: number): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;

    this.#getAllTimestamps().forEach((timestamp) => {
      timestamp?.unpause?.(unpausedAt);
    });

    for (const child of this.#children) {
      child.unpause(unpausedAt);
    }

    this.afterUnpause();
  }

  *waitForTimestamp(timestamp: Timestamp): TEffectGenerator<void> {
    return yield (resolve) => {
      return timestamp.subscribe(resolve);
    };
  }
}
