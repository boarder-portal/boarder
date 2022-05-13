import mapValues from 'lodash/mapValues';
import { Socket } from 'socket.io';

import { EGame, TGameEvent, TGameEventData, TGamePlayer } from 'common/types/game';

import Game, { TPlayerEventListeners } from 'server/gamesData/Game/Game';

interface IEntityContext<G extends EGame> {
  game: Game<G>;

  listen(events: TPlayerEventListeners<G>, player?: string | null): () => void;
  sendSocketEvent<Event extends TGameEvent<G>>(event: Event, data: TGameEventData<G, Event>, socket?: Socket): void;
}

enum EEffect {
  DELAY = 'DELAY',
  LISTEN_SOCKET = 'LISTEN_SOCKET',
  REPEAT_TASK = 'REPEAT_TASK',
  RACE = 'RACE',
  WAIT_FOR_ENTITY = 'WAIT_FOR_ENTITY',
  WAIT_PLAYER_SOCKET_EVENT = 'WAIT_PLAYER_SOCKET_EVENT',
  WAIT_SOCKET_EVENT = 'WAIT_SOCKET_EVENT',
}

interface IDelayEffect {
  type: EEffect.DELAY;
  ms: number;
}

interface IListenSocketEffect<Game extends EGame> {
  type: EEffect.LISTEN_SOCKET;
  check(): boolean;
  events: TPlayerEventListeners<Game>;
  player?: string | null;
}

interface IRaceEffect<Game extends EGame> {
  type: EEffect.RACE;
  generators: TGenerator<Game, unknown>[];
}

interface IRepeatTaskEffect<Result> {
  type: EEffect.REPEAT_TASK;
  ms: number;
  task(): Result | void;
}

interface IWaitEntityEffect<Game extends EGame, Result> {
  type: EEffect.WAIT_FOR_ENTITY;
  entity: GameEntity<Game, Result>;
}

interface IWaitPlayerSocketEventEffect<Game extends EGame, Event extends TGameEvent<Game>> {
  type: EEffect.WAIT_PLAYER_SOCKET_EVENT;
  event: Event;
  player: string;
  validate?(data: unknown): asserts data is TGameEventData<Game, Event>;
}

interface IWaitSocketEventEffect<Game extends EGame, Event extends TGameEvent<Game>> {
  type: EEffect.WAIT_SOCKET_EVENT;
  event: Event;
  validate?(data: unknown): asserts data is TGameEventData<Game, Event>;
}

type TEffect<Game extends EGame> =
  | IDelayEffect
  | IListenSocketEffect<Game>
  | IRaceEffect<Game>
  | IRepeatTaskEffect<unknown>
  | IWaitEntityEffect<Game, unknown>
  | IWaitPlayerSocketEventEffect<Game, TGameEvent<Game>>
  | IWaitSocketEventEffect<Game, TGameEvent<Game>>

interface IEffectResult<Result> {
  promise: Promise<Result>;
  cancel(): void;
}

export type TGenerator<Game extends EGame, Result = void, Yield = unknown> = Generator<TEffect<Game>, Result, Yield>;

export type TGeneratorReturnValue<Game extends EGame, Generator> = Generator extends TGenerator<Game, infer Result>
  ? Result
  : never;

export type TLifecycle<Game extends EGame, Result = void> = TGenerator<Game, Result>;

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
      throw new Error('No context. You need to spawn entities using spawnEntity');
    }

    return this.context;
  }

  #handleAnyEffect<Result>(
    callback: (
      resolve: (result: Result) => void,
      reject: (error: unknown) => void,
    ) => (() => unknown) | void,
  ): IEffectResult<Result> {
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

        const removeUnsubscriber = this.#addUnsubscriber(() => {
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

  #handleDelayEffect(effect: IDelayEffect): IEffectResult<void> {
    return this.#handleAnyEffect((resolve) => {
      const timeout = setTimeout(resolve, effect.ms);

      return () => {
        clearTimeout(timeout);
      };
    });
  }

  #handleEffect(effect: TEffect<Game>): IEffectResult<unknown> | undefined {
    if (effect.type === EEffect.DELAY) {
      return this.#handleDelayEffect(effect);
    }

    if (effect.type === EEffect.LISTEN_SOCKET) {
      return this.#handleListenSocketEffect(effect);
    }

    if (effect.type === EEffect.RACE) {
      return this.#handleRaceEffect(effect);
    }

    if (effect.type === EEffect.REPEAT_TASK) {
      return this.#handleRepeatTaskEffect(effect);
    }

    if (effect.type === EEffect.WAIT_FOR_ENTITY) {
      return this.#handleWaitEntityEffect(effect);
    }

    if (effect.type === EEffect.WAIT_PLAYER_SOCKET_EVENT) {
      return this.#handleWaitPlayerSocketEffect(effect);
    }

    if (effect.type === EEffect.WAIT_SOCKET_EVENT) {
      return this.#handleWaitSocketEffect(effect);
    }
  }

  #handleListenSocketEffect(effect: IListenSocketEffect<Game>): IEffectResult<void> {
    return this.#handleAnyEffect((resolve, reject) => {
      if (!effect.check()) {
        Promise.resolve().then(resolve);

        return;
      }

      return this.#getContext().listen(
        mapValues(effect.events, (handler) => {
          return (data, player) => {
            try {
              handler?.(data, player);

              if (!effect.check()) {
                resolve();
              }
            } catch (err) {
              reject(err);
            }
          };
        }),
        effect.player,
      );
    });
  }

  #handleRaceEffect(effect: IRaceEffect<Game>): IEffectResult<unknown> {
    return this.#handleAnyEffect((resolve, reject) => {
      const cancels = effect.generators.map((generator) => {
        let cancel: (() => void) | undefined;

        (async () => {
          let prevResult: unknown;

          while (true) {
            const { value, done } = generator.next(prevResult);

            if (done) {
              return value;
            }

            const effectResult = this.#handleEffect(value);

            cancel = () => {
              effectResult?.cancel();
            };

            if (effectResult) {
              prevResult = await effectResult.promise;
            }

            cancel = undefined;
          }
        })().then(resolve, reject);

        return () => {
          cancel?.();
        };
      });

      return () => {
        cancels.forEach((cancel) => {
          cancel();
        });
      };
    });
  }

  #handleRepeatTaskEffect<Result>(effect: IRepeatTaskEffect<Result>): IEffectResult<Result> {
    return this.#handleAnyEffect((resolve, reject) => {
      let promiseChain = Promise.resolve();

      const interval = setInterval(() => {
        promiseChain = promiseChain.then(async () => {
          try {
            const result = await effect.task();

            if (result !== undefined) {
              clearInterval(interval);

              resolve(result);
            }
          } catch (err) {
            reject(err);
          }
        });
      }, effect.ms);

      return () => {
        clearInterval(interval);
      };
    });
  }

  #handleWaitEntityEffect<Result>(effect: IWaitEntityEffect<Game, Result>): IEffectResult<Result> {
    return this.#handleAnyEffect((resolve, reject) => {
      effect.entity.run().then(resolve, reject);
    });
  }

  #handleWaitPlayerSocketEffect<Event extends TGameEvent<Game>>(
    effect: IWaitPlayerSocketEventEffect<Game, Event>,
  ): IEffectResult<TGameEventData<Game, Event>> {
    return this.#handleAnyEffect((resolve) => {
      return this.#getContext().listen({
        [effect.event]: (data: unknown) => {
          try {
            if (effect?.validate?.(data) ?? true) {
              resolve(data);
            }
          } catch {
            // empty
          }
        },
      } as any, effect.player);
    });
  }

  #handleWaitSocketEffect<Event extends TGameEvent<Game>>(
    effect: IWaitSocketEventEffect<Game, Event>,
  ): IEffectResult<TGameEventData<Game, Event>> {
    return this.#handleAnyEffect((resolve) => {
      return this.#getContext().listen({
        [effect.event]: (data: unknown, player: TGamePlayer<Game>) => {
          try {
            if (effect?.validate?.(data) ?? true) {
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

  *delay(ms: number): TGenerator<Game> {
    yield {
      type: EEffect.DELAY,
      ms,
    };
  }

  destroy(): void {
    for (const child of this.#children) {
      child.destroy();
    }

    for (const unsubscriber of this.#unsubscribers) {
      unsubscriber();
    }
  }

  getPlayerByLogin(login: string | undefined): TGamePlayer<Game> | undefined {
    return this.#getContext().game.getPlayerByLogin(login);
  }

  *listenSocketWhile(check: () => boolean, events: TPlayerEventListeners<Game>, player?: string | null): TGenerator<Game> {
    yield {
      type: EEffect.LISTEN_SOCKET,
      check,
      events,
      player,
    };
  }

  *race<T extends TGenerator<Game, unknown>[]>(generators: T): TGenerator<Game, TGeneratorReturnValue<Game, T[number]>, TGeneratorReturnValue<Game, T[number]>> {
    return yield {
      type: EEffect.RACE,
      generators,
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
    if (this.#lifecycle) {
      return this.#lifecycle;
    }

    return (
      this.#lifecycle = (async () => {
        try {
          const iterator = this.lifecycle();
          let prevResult: unknown;

          while (true) {
            const { value, done } = iterator.next(prevResult);

            if (done) {
              return value;
            }

            const effectResult = this.#handleEffect(value);

            if (effectResult) {
              prevResult = await effectResult.promise;
            }
          }
        } finally {
          this.destroy();
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

  *waitForEntity<Result>(entity: GameEntity<Game, Result>): TGenerator<Game, Result, Result> {
    return yield {
      type: EEffect.WAIT_FOR_ENTITY,
      entity,
    };
  }

  *waitForPlayerSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    options: IWaitForPlayerSocketEventOptions<Game, Event>,
  ): TGenerator<Game, TGameEventData<Game, Event>> {
    return yield {
      type: EEffect.WAIT_PLAYER_SOCKET_EVENT,
      event,
      validate: options.validate,
      player: options.player,
    };
  }

  *waitForSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    options?: IWaitForSocketEventOptions<Game, Event>,
  ): TGenerator<Game, IWaitForSocketEventResult<Game, Event>, IWaitForSocketEventResult<Game, Event>> {
    return yield {
      type: EEffect.WAIT_SOCKET_EVENT,
      event,
      validate: options?.validate,
    };
  }
}
