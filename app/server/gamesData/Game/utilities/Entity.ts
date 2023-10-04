import map from 'lodash/map';

import { Timestamp as TimestampModel } from 'common/types';
import { GameOptions, GameType } from 'common/types/game';

import Timestamp from 'common/utilities/Timestamp';
import AbortError from 'server/gamesData/Game/utilities/AbortError';
import Trigger from 'server/gamesData/Game/utilities/Trigger';
import { now } from 'server/utilities/time';

import Game from 'server/gamesData/Game/Game';

export interface EntityContext<G extends GameType> {
  game: Game<G>;
}

export type ParentOrContext<Game extends GameType> = EntityContext<Game> | Entity<Game, any>;

interface GeneratorResult<Result> {
  run(resolve: Resolve<Result>, reject: Reject): void;
  cancel(): void;
}

export type EffectCallback<Result> = (
  resolve: (result: Result) => void,
  reject: (error: unknown) => void,
) => (() => unknown) | void;

export type EntityGenerator<Result = void, Yield = never, EffectResult = unknown> = Generator<
  EffectCallback<EffectResult>,
  Result,
  Yield
>;

export type IterableOrGenerator<Result = void, Yield = never, EffectResult = unknown> =
  | EntityGenerator<Result, Yield, EffectResult>
  | {
      [Symbol.iterator](): EntityGenerator<Result, Yield, EffectResult>;
    };

export type EffectGenerator<Result> = EntityGenerator<Result, Result, Result>;

export type GeneratorReturnValue<Generator> = Generator extends EntityGenerator<infer Result>
  ? Result
  : Generator extends {
      [Symbol.iterator](): EntityGenerator<infer Result>;
    }
  ? Result
  : never;

type EffectResult<Result> =
  | {
      type: 'success';
      value: Result;
    }
  | {
      type: 'error';
      error: unknown;
    };

type AbortCallback = () => unknown;

type CancelTask = (() => void) | undefined;

type Resolve<Result> = (result: Result) => unknown;

type Reject = (err: unknown) => unknown;

type AllEffectReturnValue<T extends IterableOrGenerator<unknown>[]> = {
  [P in keyof T]: GeneratorReturnValue<T[P]>;
};

type RaceObjectReturnValue<T> = {
  [P in keyof T]: {
    type: P;
    value: T extends Record<string, IterableOrGenerator<unknown>> ? GeneratorReturnValue<T[P]> : never;
  };
}[keyof T];

export default abstract class Entity<Game extends GameType, Result = unknown> {
  #children = new Set<Entity<Game>>();
  #parent: Entity<Game, any> | null = null;
  #abortCallbacks = new Set<AbortCallback>();
  #successCallbacks = new Set<Resolve<Result>>();
  #errorCallbacks = new Set<Reject>();
  #timestamps = new Set<Timestamp>();
  #started = false;
  #destroyed = false;
  #result: EffectResult<Result> | undefined;
  spawned = false;
  paused = false;

  readonly context: EntityContext<Game>;
  readonly options: GameOptions<Game>;

  constructor(parentOrContext: ParentOrContext<Game>) {
    const context = parentOrContext instanceof Entity ? parentOrContext.context : parentOrContext;

    this.context = context;
    this.options = context.game.options;
  }

  protected abstract lifecycle(): EntityGenerator<Result>;

  #addAbortCallback(abortCallback: AbortCallback): () => void {
    this.#abortCallbacks.add(abortCallback);

    return () => {
      this.#abortCallbacks.delete(abortCallback);
    };
  }

  #getAllTimestamps(): (TimestampModel | null | undefined)[] {
    return [...this.#timestamps, ...(this.getCurrentTimestamps?.() ?? [])];
  }

  #getGeneratorResult<Result>(generatorOrIterable: IterableOrGenerator<Result>): GeneratorResult<Result> {
    const generator: EntityGenerator<Result> = generatorOrIterable[Symbol.iterator]();
    let cancel: CancelTask;

    return {
      run: (resolve, reject) => {
        let prevResult: EffectResult<never> = {
          type: 'success',
          value: undefined as never,
        };

        const runIteration = () => {
          let iteratorResult: IteratorResult<EffectCallback<unknown>, Result>;

          try {
            iteratorResult =
              prevResult.type === 'success' ? generator.next(prevResult.value) : generator.throw(prevResult.error);
          } catch (err) {
            return reject(err);
          }

          if (iteratorResult.done) {
            return resolve(iteratorResult.value);
          }

          const effectResult: GeneratorResult<unknown> = this.#handleAnyEffect(iteratorResult.value);

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

  #handleAnyEffect<Result>(callback: EffectCallback<Result>): GeneratorResult<Result> {
    let unregisterEffect: CancelTask;

    return {
      run: (resolve, reject) => {
        let resolvedOrRejected = false;
        let async = false;
        let syncResult: EffectResult<Result> | undefined;

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

  *afterLifecycle(): EntityGenerator {
    // empty
  }

  afterPause(): void {
    // empty
  }

  afterUnpause(): void {
    // empty
  }

  *all<T extends IterableOrGenerator<unknown>[]>(generators: T): EffectGenerator<AllEffectReturnValue<T>> {
    return yield (resolve, reject) => {
      const results: unknown[] = generators.map(() => undefined);
      let resultsLeft = generators.length;

      const cancels = generators.map((generator, index) => {
        const { run, cancel } = this.#getGeneratorResult(generator);

        run((result) => {
          results[index] = result;

          resultsLeft--;

          if (!resultsLeft) {
            resolve(results as AllEffectReturnValue<T>);
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

  *async<Result>(callback: EffectCallback<Result>): EffectGenerator<Result> {
    return yield callback;
  }

  *beforeLifecycle(): EntityGenerator {
    // empty
  }

  createTimestamp(addMs = 0): Timestamp {
    return new Timestamp({
      addMs,
      now,
    });
  }

  createTrigger<Value = void>(): Trigger<Value> {
    return new Trigger();
  }

  *delay(ms: number): EffectGenerator<void> {
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

  *eternity(): EffectGenerator<void> {
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

  getCurrentTimestamps?(): (TimestampModel | null | undefined)[];

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

  race<T extends (IterableOrGenerator<unknown> | null | undefined)[]>(
    generators: T,
  ): EffectGenerator<GeneratorReturnValue<T[keyof T]>>;
  race<T extends Record<string, IterableOrGenerator<unknown> | null | undefined>>(
    generators: T,
  ): EffectGenerator<RaceObjectReturnValue<T>>;
  *race<T extends IterableOrGenerator<unknown>[] | Record<string, IterableOrGenerator<unknown>>>(
    generators: T,
  ): EffectGenerator<
    T extends IterableOrGenerator<unknown>[] ? GeneratorReturnValue<T[keyof T]> : RaceObjectReturnValue<T>
  > {
    return yield (resolve, reject) => {
      const cancels = map(generators, (generator, key) => {
        if (!generator) {
          return;
        }

        const { run, cancel } = this.#getGeneratorResult(generator as any as EntityGenerator<Result>);

        run((result) => {
          resolve(Array.isArray(generators) ? result : ({ type: key, value: result } as any));
        }, reject);

        return cancel;
      });

      return () => {
        cancels.forEach((cancel) => {
          cancel?.();
        });
      };
    };
  }

  *repeatTask<Result = void>(
    ms: number,
    task: (this: this) => EntityGenerator<Result | void>,
  ): EntityGenerator<Result> {
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

  run(resolve: Resolve<Result>, reject: Reject): () => void {
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

    ((resolve: Resolve<Result>, reject: Reject) => {
      this.#getGeneratorResult(this.beforeLifecycle()).run(() => {
        const runAfterLifecycle = (resolve: Resolve<void>, reject: Reject) => {
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

  spawnTask<Result>(action: EntityGenerator<Result>): EntityGenerator<Result> {
    const { run } = this.#getGeneratorResult(action);

    let taskResult: EffectResult<Result> | undefined;
    let taskResolve: Resolve<Result> | undefined;
    let taskReject: Reject | undefined;
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

    return (function* (): EffectGenerator<Result> {
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

  *[Symbol.iterator](): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.run(resolve, reject);
    };
  }

  toJSON(): unknown {
    throw new Error('Provide custom toJSON');
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

  *waitForTimestamp(timestamp: Timestamp): EffectGenerator<void> {
    return yield (resolve) => {
      return timestamp.subscribe(resolve);
    };
  }

  *waitForTrigger<Value>(trigger: Trigger<Value>): EffectGenerator<Value> {
    return yield (resolve) => {
      return trigger.subscribe(resolve);
    };
  }
}
