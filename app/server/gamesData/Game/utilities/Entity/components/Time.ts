import Timestamp from 'common/utilities/Timestamp';
import Entity, { AnyEntity, EffectGenerator, EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';

export interface TimeOptions<E extends AnyEntity> {
  getBoundTimestamps?(this: E): (Timestamp | null | undefined)[];
  isPauseAvailable?(this: E): boolean;
  afterPause?(this: E): void;
  afterUnpause?(this: E): void;
}

export default class Time<E extends AnyEntity = Entity> extends EntityComponent<E> {
  readonly #getBoundTimestampsCallback: TimeOptions<E>['getBoundTimestamps'];
  readonly #isPauseAvailableCallback: TimeOptions<E>['isPauseAvailable'];
  readonly #afterPauseCallback: TimeOptions<E>['afterPause'];
  readonly #afterUnpauseCallback: TimeOptions<E>['afterUnpause'];

  readonly #timestamps = new Set<Timestamp>();
  #paused = false;

  constructor(options?: TimeOptions<E>) {
    super();

    this.#getBoundTimestampsCallback = options?.getBoundTimestamps;
    this.#isPauseAvailableCallback = options?.isPauseAvailable;
    this.#afterPauseCallback = options?.afterPause;
    this.#afterUnpauseCallback = options?.afterUnpause;
  }

  *#getBoundTimestamps(): Generator<Timestamp> {
    for (const timestamp of this.#timestamps) {
      yield timestamp;
    }

    const boundTimestamps = this.#getBoundTimestampsCallback?.call(this.entity);

    if (boundTimestamps) {
      for (const timestamp of boundTimestamps) {
        if (timestamp) {
          yield timestamp;
        }
      }
    }
  }

  #isPauseAvailable(defaultValue: boolean = false): boolean {
    return this.#isPauseAvailableCallback?.call(this.entity) ?? defaultValue;
  }

  #pause(pausedAt: number, withChildren: boolean): void {
    if (this.#paused || !this.#isPauseAvailable(!withChildren)) {
      return;
    }

    this.#paused = true;

    for (const timestamp of this.#getBoundTimestamps()) {
      timestamp.pause(pausedAt);
    }

    if (withChildren) {
      for (const timeComponent of this.entity.getNestedChildrenComponents(Time)) {
        timeComponent.#pause(pausedAt, false);
      }
    }

    this.#afterPauseCallback?.call(this.entity);
  }

  #unpause(unpausedAt: number, withChildren: boolean): void {
    if (!this.#paused || !this.#isPauseAvailable(!withChildren)) {
      return;
    }

    this.#paused = false;

    for (const timestamp of this.#getBoundTimestamps()) {
      timestamp.unpause(unpausedAt);
    }

    if (withChildren) {
      for (const timeComponent of this.entity.getNestedChildrenComponents(Time)) {
        timeComponent.#unpause(unpausedAt, false);
      }
    }

    this.#afterUnpauseCallback?.call(this.entity);
  }

  get pauseAvailable(): boolean {
    return this.#isPauseAvailable();
  }

  get paused(): boolean {
    return this.#paused;
  }

  createTimestamp(addMs = 0): Timestamp {
    return new Timestamp({
      addMs,
    });
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

  pause(pausedAt: number): void {
    this.#pause(pausedAt, true);
  }

  *repeatTask<Result = void>(ms: number, task: (this: E) => EntityGenerator<Result | void>): EntityGenerator<Result> {
    let msToNextTask = ms;

    while (true) {
      yield* this.delay(msToNextTask);

      const timestamp = this.createTimestamp();
      const result = yield* task.call(this.entity);

      if (result !== undefined) {
        return result;
      }

      msToNextTask = ms - timestamp.timePassed;
    }
  }

  unpause(unpausedAt: number): void {
    this.#unpause(unpausedAt, true);
  }

  *waitForTimestamp(timestamp: Timestamp): EffectGenerator<void> {
    return yield (resolve) => {
      return timestamp.subscribe(resolve);
    };
  }
}
