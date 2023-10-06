import map from 'lodash/map';
import noop from 'lodash/noop';

import AbortError from 'common/utilities/AbortError';
import Timestamp from 'common/utilities/Timestamp';
import Trigger from 'common/utilities/Trigger';

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

export type AnyEntity<Context> = Entity<Context, any>;

export type ParentEntity<Context> = AnyEntity<Context> | null;

export default abstract class Entity<Context, Result = unknown> {
  #children = new Set<AnyEntity<Context>>();
  #abortCallbacks = new Set<AbortCallback>();
  #successCallbacks = new Set<Resolve<Result>>();
  #errorCallbacks = new Set<Reject>();
  #timestamps = new Set<Timestamp>();
  #started = false;
  #destroyed = false;
  #result: EffectResult<Result> | undefined;
  paused = false;
  context: Context | undefined;

  readonly #parent: ParentEntity<Context> = null;

  constructor(parent: ParentEntity<Context>) {
    this.#parent = parent;
  }

  protected abstract lifecycle(): EntityGenerator<Result>;

  #addAbortCallback(abortCallback: AbortCallback): () => void {
    this.#abortCallbacks.add(abortCallback);

    return () => {
      this.#abortCallbacks.delete(abortCallback);
    };
  }

  #getAllTimestamps(): (Timestamp | null | undefined)[] {
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
    if (this.#parent) {
      this.#parent.#children.delete(this);
    }
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
    if (this.#parent) {
      this.#parent.#children.add(this);
    }
  }

  createTimestamp(addMs = 0): Timestamp {
    return new Timestamp({
      addMs,
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

  getContext(): Context {
    const context = this.context ?? this.#parent?.getContext();

    if (!context) {
      throw new Error('No context');
    }

    return context;
  }

  getCurrentTimestamps?(): (Timestamp | null | undefined)[];

  pause(pausedAt: number): void {
    if (this.paused) {
      return;
    }

    this.paused = true;

    this.#getAllTimestamps().forEach((timestamp) => {
      timestamp?.pause(pausedAt);
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

  run(resolve: Resolve<Result> = noop, reject: Reject = noop): () => void {
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

  toJSON(): unknown {
    throw new Error('Provide custom toJSON');
  }

  unpause(unpausedAt: number): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;

    this.#getAllTimestamps().forEach((timestamp) => {
      timestamp?.unpause(unpausedAt);
    });

    for (const child of this.#children) {
      child.unpause(unpausedAt);
    }

    this.afterUnpause();
  }

  *waitForEntity<Result>(entity: Entity<Context, Result>): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return entity.run(resolve, reject);
    };
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
