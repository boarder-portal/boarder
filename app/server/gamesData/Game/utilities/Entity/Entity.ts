import map from 'lodash/map';

import Timestamp from 'common/utilities/Timestamp';
import EntityComponent, {
  EntityComponentConstructor,
  SimpleEntityComponentConstructor,
} from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import AbortError from 'server/gamesData/Game/utilities/Entity/utilities/AbortError';
import ValueProxy, { ValueProxyWrapOptions } from 'server/gamesData/Game/utilities/Entity/utilities/ValueProxy';

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

export type EffectResult<Result> =
  | {
      type: 'success';
      value: Result;
    }
  | {
      type: 'error';
      error: unknown;
    };

export type Unsubscribe = () => void;

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

export interface EntityInternalApi {
  get currentComponentEntity(): AnyEntity | undefined;
  onAddComponentCallback<E extends Entity>(
    entity: E,
    component: EntityComponent<E>,
    constructor: EntityComponentConstructor<E>,
  ): void;
  wrapTimestamp(entity: AnyEntity, timestamp: Timestamp): Timestamp;
}

export type AnyEntity = Entity<any>;

export type ParentEntity = AnyEntity | null;

export type EntityConstructor<E extends AnyEntity = AnyEntity> = new (...args: any[]) => E;

export interface GetClosestComponentOptions {
  cached?: boolean;
  throwOnNone?: boolean;
}

export interface GetClosestEntityOptions {
  cached?: boolean;
  throwOnNone?: boolean;
}

export interface GetComponentOptions {
  cached?: boolean;
  throwOnNone?: boolean;
}

let currentEntityParent: ParentEntity | undefined;
let currentEntityWrapOptions: ValueProxyWrapOptions | undefined;
let currentComponentEntity: AnyEntity | undefined;

export default abstract class Entity<Result = unknown> {
  static internalApi: EntityInternalApi = {
    get currentComponentEntity(): AnyEntity | undefined {
      return currentComponentEntity;
    },
    onAddComponentCallback(entity, component, constructor) {
      const typeComponents = entity._components.get(constructor);

      if (typeComponents) {
        typeComponents.add(component);
      } else {
        entity._components.set(constructor, new Set([component]));
      }
    },
    wrapTimestamp(entity, timestamp): Timestamp {
      const wrapOptions = entity._wrapOptions;

      return wrapOptions ? ValueProxy.wrap(timestamp, wrapOptions) : timestamp;
    },
  };

  private static _spawnEntity<Constructor extends EntityConstructor>(
    parent: ParentEntity,
    constructor: Constructor,
    options: {
      wrapOptions?: ValueProxyWrapOptions | null;
      args: ConstructorParameters<Constructor>;
    },
  ): InstanceType<Constructor> {
    const wrapOptions = options.wrapOptions ?? parent?._wrapOptions;

    currentEntityParent = parent;
    currentEntityWrapOptions = wrapOptions ?? undefined;

    let entity = new constructor(...options.args) as InstanceType<Constructor>;

    if (wrapOptions) {
      entity = ValueProxy.wrap(entity, wrapOptions);
    }

    currentEntityParent = undefined;
    currentEntityWrapOptions = undefined;

    entity._run();

    return entity;
  }

  static spawnRoot<Constructor extends EntityConstructor>(
    constructor: Constructor,
    options?: {
      wrapOptions?: ValueProxyWrapOptions | null;
    } | null,
    ...args: ConstructorParameters<Constructor>
  ): InstanceType<Constructor> {
    return this._spawnEntity(null, constructor, {
      wrapOptions: options?.wrapOptions,
      args,
    });
  }

  private readonly _parent: ParentEntity;
  private readonly _wrapOptions: ValueProxyWrapOptions | null;
  private readonly _children = new Set<AnyEntity>();
  private readonly _getClosestComponentCache = new Map<EntityComponentConstructor, EntityComponent<AnyEntity> | null>();
  private readonly _getClosestEntityCache = new Map<EntityConstructor, AnyEntity | null>();
  private readonly _components = new Map<EntityComponentConstructor<this>, Set<EntityComponent<this>>>();
  private readonly _getComponentCache = new Map<EntityComponentConstructor<this>, EntityComponent<this> | null>();
  private readonly _abortCallbacks = new Set<AbortCallback>();
  private readonly _successCallbacks = new Set<Resolve<Result>>();
  private readonly _errorCallbacks = new Set<Reject>();

  private _started = false;
  private _initialized = false;
  private _ended = false;
  private _destroyed = false;
  private _result: EffectResult<Result> | undefined;

  constructor() {
    if (currentEntityParent === undefined) {
      throw new Error(
        'Creating entities using new() is not allowed, use Entity#spawnEntity or Entity.spawnRoot instead',
      );
    }

    this._parent = currentEntityParent;
    this._wrapOptions = currentEntityWrapOptions ?? currentEntityParent?._wrapOptions ?? null;

    if (this._parent) {
      this._parent._children.add(this);
    }
  }

  beforeLifecycle(): void {
    for (const component of this.getComponents()) {
      component.onInit();
    }

    this._initialized = true;
  }

  protected abstract lifecycle(): EntityGenerator<Result>;

  afterLifecycle(): void {
    for (const component of this.getComponents()) {
      component.onDestroy();
    }

    if (this._parent) {
      this._parent._children.delete(this);
    }

    this._ended = true;
  }

  private _addAbortCallback(abortCallback: AbortCallback): Unsubscribe {
    this._abortCallbacks.add(abortCallback);

    return () => {
      this._abortCallbacks.delete(abortCallback);
    };
  }

  private _getGeneratorResult<Result>(generatorOrIterable: IterableOrGenerator<Result>): GeneratorResult<Result> {
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

          const effectResult: GeneratorResult<unknown> = this._handleAnyEffect(iteratorResult.value);

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

  private _handleAnyEffect<Result>(callback: EffectCallback<Result>): GeneratorResult<Result> {
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

        const removeUnsubscriber = this._addAbortCallback(() => {
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

  private _run(resolve?: Resolve<Result>, reject?: Reject): Unsubscribe {
    const unsubscribe = () => {
      if (resolve) {
        this._successCallbacks.delete(resolve);
      }

      if (reject) {
        this._errorCallbacks.delete(reject);
      }
    };

    if (this._result) {
      if (this._result.type === 'success') {
        resolve?.(this._result.value);
      } else {
        reject?.(this._result.error);
      }

      return unsubscribe;
    }

    if (resolve) {
      this._successCallbacks.add(resolve);
    }

    if (reject) {
      this._errorCallbacks.add(reject);
    }

    if (this._started) {
      return unsubscribe;
    }

    this._started = true;

    this.beforeLifecycle();

    if (!this._initialized) {
      throw new Error(`${this.constructor.name}#beforeLifecycle not called`);
    }

    this._getGeneratorResult(this.lifecycle()).run(
      (result) => {
        this._setResult({
          type: 'success',
          value: result,
        });

        this._successCallbacks.forEach((successCallback) => successCallback(result));
      },
      (err) => {
        this._setResult({
          type: 'error',
          error: err,
        });

        if (this._errorCallbacks.size > 0) {
          this._errorCallbacks.forEach((errorCallback) => errorCallback(err));
        } else if (!this._destroyed) {
          console.log(
            new Error(`Unhandled ${this.constructor.name} run error`, {
              cause: err,
            }),
          );
        }
      },
    );

    return unsubscribe;
  }

  private _setResult(result: EffectResult<Result>): void {
    this.afterLifecycle();

    if (!this._ended) {
      throw new Error(`${this.constructor.name}#afterLifecycle not called`);
    }

    this._result = result;
  }

  addComponent<Constructor extends EntityComponentConstructor<this>>(
    constructor: Constructor,
    ...args: ConstructorParameters<Constructor>
  ): InstanceType<Constructor> {
    currentComponentEntity = this;

    let component = new constructor(...args) as InstanceType<Constructor>;

    if (this._wrapOptions) {
      component = ValueProxy.wrap(component, this._wrapOptions);
    }

    currentComponentEntity = undefined;

    if (this._initialized) {
      component.onInit();
    }

    return component;
  }

  *all<T extends IterableOrGenerator<unknown>[]>(generators: T): EffectGenerator<AllEffectReturnValue<T>> {
    return yield (resolve, reject) => {
      const results: unknown[] = generators.map(() => undefined);
      let resultsLeft = generators.length;

      const cancels = generators.map((generator, index) => {
        const { run, cancel } = this._getGeneratorResult(generator);

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

  destroy(): void {
    this._destroyed = true;

    for (const child of this._children) {
      child.destroy();
    }

    for (const unsubscriber of this._abortCallbacks) {
      unsubscriber();
    }
  }

  *eternity(): EffectGenerator<void> {
    yield () => {
      // empty
    };
  }

  *getChildren<E extends AnyEntity, Constructor extends EntityConstructor<E>>(constructor?: Constructor): Generator<E> {
    for (const child of this._children) {
      if (!constructor || child instanceof constructor) {
        yield child as E;
      }
    }
  }

  *getChildrenComponents<Constructor extends EntityComponentConstructor>(
    constructor?: Constructor,
  ): Generator<InstanceType<Constructor>> {
    for (const child of this._children) {
      for (const component of child.getComponents(constructor)) {
        yield component;
      }
    }
  }

  getClosestComponent<Constructor extends EntityComponentConstructor>(
    constructor: Constructor,
  ): InstanceType<Constructor>;
  getClosestComponent<Constructor extends EntityComponentConstructor>(
    constructor: Constructor,
    options: { throwOnNone: true },
  ): InstanceType<Constructor>;
  getClosestComponent<Constructor extends EntityComponentConstructor>(
    constructor: Constructor,
    options: GetClosestComponentOptions,
  ): InstanceType<Constructor> | null;
  getClosestComponent<Constructor extends EntityComponentConstructor>(
    constructor: Constructor,
    options: GetClosestComponentOptions = {},
  ): InstanceType<Constructor> | null {
    const { cached = true, throwOnNone = true } = options;

    if (cached) {
      let component = this._getClosestComponentCache.get(constructor);

      if (component === undefined) {
        component = this.getClosestComponent(constructor, {
          ...options,
          cached: false,
        });

        this._getClosestComponentCache.set(constructor, component);
      }

      if (!component && throwOnNone) {
        throw new Error(`No closest ${constructor.name} component found for ${this.constructor.name} entity`);
      }

      return component as InstanceType<Constructor> | null;
    }

    let component: InstanceType<Constructor> | null = null;
    let entity: AnyEntity | null = this;

    while (!component && entity) {
      component = entity.getComponent(constructor, {
        cached: false,
        throwOnNone: false,
      });
      entity = entity._parent;
    }

    if (!component && throwOnNone) {
      throw new Error(`No closest ${constructor.name} component found for ${this.constructor.name} entity`);
    }

    return component;
  }

  getClosestEntity<Constructor extends EntityConstructor>(constructor: Constructor): InstanceType<Constructor>;
  getClosestEntity<Constructor extends EntityConstructor>(
    constructor: Constructor,
    options: { throwOnNone: true },
  ): InstanceType<Constructor>;
  getClosestEntity<Constructor extends EntityConstructor>(
    constructor: Constructor,
    options: GetClosestEntityOptions,
  ): InstanceType<Constructor> | null;
  getClosestEntity<Constructor extends EntityConstructor>(
    constructor: Constructor,
    options: GetClosestEntityOptions = {},
  ): InstanceType<Constructor> | null {
    const { cached = true, throwOnNone = true } = options;

    if (cached) {
      let closestEntity = this._getClosestEntityCache.get(constructor);

      if (closestEntity === undefined) {
        closestEntity = this.getClosestEntity(constructor, {
          ...options,
          cached: false,
        });

        this._getClosestEntityCache.set(constructor, closestEntity);
      }

      if (!closestEntity && throwOnNone) {
        throw new Error(`No closest ${constructor.name} entity found for ${this.constructor.name} entity`);
      }

      return closestEntity as InstanceType<Constructor> | null;
    }

    let entity: AnyEntity | null = this;

    while (entity) {
      if (entity instanceof constructor) {
        return entity as InstanceType<Constructor>;
      }

      entity = (entity as AnyEntity)._parent;
    }

    if (throwOnNone) {
      throw new Error(`No closest ${constructor.name} entity found for ${this.constructor.name} entity`);
    }

    return null;
  }

  getComponent<Constructor extends EntityComponentConstructor<this>>(
    constructor: Constructor,
  ): InstanceType<Constructor>;
  getComponent<Constructor extends EntityComponentConstructor<this>>(
    constructor: Constructor,
    options: { throwOnNone: true },
  ): InstanceType<Constructor>;
  getComponent<Constructor extends EntityComponentConstructor<this>>(
    constructor: Constructor,
    options: GetComponentOptions,
  ): InstanceType<Constructor> | null;
  getComponent<Constructor extends EntityComponentConstructor<this>>(
    constructor: Constructor,
    options: GetComponentOptions = {},
  ): InstanceType<Constructor> | null {
    const { cached = true, throwOnNone = true } = options;

    if (cached) {
      let component = this._getComponentCache.get(constructor);

      if (component === undefined) {
        component = this.getComponent(constructor, {
          ...options,
          cached: false,
        });

        this._getComponentCache.set(constructor, component);
      }

      if (!component && throwOnNone) {
        throw new Error(`No ${constructor.name} component found for ${this.constructor.name} entity`);
      }

      return component as InstanceType<Constructor> | null;
    }

    const typeComponents = this._components.get(constructor);
    let component: InstanceType<Constructor> | null = null;

    if (typeComponents) {
      for (const c of typeComponents) {
        component = c as InstanceType<Constructor>;

        break;
      }
    }

    if (!component && throwOnNone) {
      throw new Error(`No ${constructor.name} component found for ${this.constructor.name} entity`);
    }

    return component;
  }

  *getComponents<Constructor extends EntityComponentConstructor<this>>(
    constructor?: Constructor,
  ): Generator<InstanceType<Constructor>> {
    if (constructor) {
      const typeComponents = this._components.get(constructor);

      if (typeComponents) {
        for (const component of typeComponents) {
          yield component as InstanceType<Constructor>;
        }
      }

      return;
    }

    for (const components of this._components.values()) {
      for (const component of components) {
        yield component as InstanceType<Constructor>;
      }
    }
  }

  *getNestedChildrenComponents<Constructor extends EntityComponentConstructor>(
    constructor?: Constructor,
  ): Generator<InstanceType<Constructor>> {
    for (const child of this._children) {
      for (const component of child.getComponents(constructor)) {
        yield component;
      }

      yield* child.getNestedChildrenComponents(constructor);
    }
  }

  obtainComponent<Constructor extends SimpleEntityComponentConstructor<this>>(
    constructor: Constructor,
  ): InstanceType<Constructor> {
    return (
      this.getComponent(constructor, {
        cached: false,
        throwOnNone: false,
        // @ts-ignore
      }) ?? this.addComponent(constructor)
    );
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

        const { run, cancel } = this._getGeneratorResult(generator as any as EntityGenerator<Result>);

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

  removeComponent<C extends EntityComponent<this>>(component: C): C {
    const { constructor } = Object.getPrototypeOf(component);
    const typeComponents = this._components.get(constructor);

    if (typeComponents) {
      typeComponents.delete(component);

      if (typeComponents.size === 0) {
        this._components.delete(constructor);
      }
    }

    return component;
  }

  spawnEntity<Constructor extends EntityConstructor>(
    constructor: Constructor,
    ...args: ConstructorParameters<Constructor>
  ): InstanceType<Constructor> {
    return Entity._spawnEntity(this, constructor, {
      args,
    });
  }

  spawnTask<Result>(action: EntityGenerator<Result>): EntityGenerator<Result> {
    const { run } = this._getGeneratorResult(action);

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
        } else if (!this._destroyed) {
          console.log(
            new Error(`Unhandled ${this.constructor.name}#spawnTask error`, {
              cause: error,
            }),
          );
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

  subscribe(resolve?: Resolve<Result>, reject?: Reject): Unsubscribe {
    return this._run(resolve, reject);
  }

  toJSON(): unknown {
    throw new Error('Provide custom toJSON');
  }

  *waitForEntity<Result>(entity: Entity<Result>): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return entity._run(resolve, reject);
    };
  }
}
