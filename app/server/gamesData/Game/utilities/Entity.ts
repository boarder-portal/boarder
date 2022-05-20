import { Socket } from 'socket.io';

import { EGame, TGameEvent, TGameEventData, TGameOptions, TGamePlayer } from 'common/types/game';

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

type TAbortCallback = () => unknown;

type TAllEffectReturnValue<T extends TGenerator<unknown>[]> = {
  [P in keyof T]: TGeneratorReturnValue<T[number]>;
};

export interface IWaitForSocketEventOptions<Game extends EGame, Event extends TGameEvent<Game>> {
  validate?(data: unknown): asserts data is TGameEventData<Game, Event>;
}

export interface IWaitForSocketEventResult<Game extends EGame, Event extends TGameEvent<Game>> {
  data: TGameEventData<Game, Event>;
  playerIndex: number;
}

export interface IWaitForPlayerSocketEventOptions<Game extends EGame, Event extends TGameEvent<Game>>
  extends IWaitForSocketEventOptions<Game, Event> {
  playerIndex: number;
  validate?(data: unknown): asserts data is TGameEventData<Game, Event>;
}

export default abstract class Entity<Game extends EGame, Result = unknown> {
  #children = new Set<Entity<Game>>();
  #lifecycle: Promise<Result> | null = null;
  #parent: Entity<Game> | null = null;
  #abortCallbacks = new Set<TAbortCallback>();
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

  *async<Result>(callback: TEffectCallback<Result>): TEffectGenerator<Result> {
    return yield callback;
  }

  *delay(ms: number): TEffectGenerator<void> {
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

  forEachPlayer(callback: (playerIndex: number) => unknown): void {
    this.getPlayers().forEach(({ index }) => callback(index));
  }

  getPlayers(): TGamePlayer<Game>[] {
    return this.context.game.players;
  }

  getPlayersData<Data>(callback: (playerIndex: number) => Data): Data[] {
    return this.getPlayers().map(({ index }) => callback(index));
  }

  getPlayersWithData<Data>(mapper: (player: TGamePlayer<Game>) => Data): (TGamePlayer<Game> & { data: Data })[] {
    return this.getPlayers().map((player) => ({
      ...player,
      data: mapper(player),
    }));
  }

  get playersCount(): number {
    return this.getPlayers().length;
  }

  *race<T extends TGenerator<unknown>[]>(generators: T): TEffectGenerator<TGeneratorReturnValue<T[number]>> {
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

  *repeatTask<Result = void>(ms: number, task: () => Result | Promise<Result>): TEffectGenerator<Result> {
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

    return (this.#lifecycle = (async () => {
      let cancelGenerator: (() => void) | undefined;

      try {
        const { run, cancel } = this.#getGeneratorResult(this.lifecycle());

        cancelGenerator = cancel;

        return await run();
      } finally {
        cancelGenerator?.();

        this.destroy();
      }
    })());
  }

  sendSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    data: TGameEventData<Game, Event>,
    socket?: Socket,
  ): void {
    this.context.game.sendSocketEvent(event, data, socket);
  }

  spawnEntity<E extends Entity<Game>>(entity: E): E {
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

  *[Symbol.iterator](): TEffectGenerator<Result> {
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
  ): TEffectGenerator<TGameEventData<Game, Event>> {
    return yield (resolve) => {
      return this.context.game.listenSocketEvent(
        event,
        (data) => {
          try {
            if (options?.validate?.(data) ?? true) {
              resolve(data);
            }
          } catch {
            // empty
          }
        },
        options.playerIndex,
      );
    };
  }

  *waitForSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    options?: IWaitForSocketEventOptions<Game, Event>,
  ): TEffectGenerator<IWaitForSocketEventResult<Game, Event>> {
    return yield (resolve) => {
      this.context.game.listenSocketEvent(event, (data, playerIndex) => {
        try {
          if (options?.validate?.(data) ?? true) {
            resolve({
              data,
              playerIndex,
            });
          }
        } catch {
          // empty
        }
      });
    };
  }
}
