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
  private readonly _getBoundTimestampsCallback: TimeOptions<E>['getBoundTimestamps'];
  private readonly _isPauseAvailableCallback: TimeOptions<E>['isPauseAvailable'];
  private readonly _afterPauseCallback: TimeOptions<E>['afterPause'];
  private readonly _afterUnpauseCallback: TimeOptions<E>['afterUnpause'];

  private readonly _timestamps = new Set<Timestamp>();

  private _paused = false;

  constructor(options?: TimeOptions<E>) {
    super();

    this._getBoundTimestampsCallback = options?.getBoundTimestamps;
    this._isPauseAvailableCallback = options?.isPauseAvailable;
    this._afterPauseCallback = options?.afterPause;
    this._afterUnpauseCallback = options?.afterUnpause;
  }

  private *_getBoundTimestamps(): Generator<Timestamp> {
    for (const timestamp of this._timestamps) {
      yield timestamp;
    }

    const boundTimestamps = this._getBoundTimestampsCallback?.call(this.entity);

    if (boundTimestamps) {
      for (const timestamp of boundTimestamps) {
        if (timestamp) {
          yield timestamp;
        }
      }
    }
  }

  private _isPauseAvailable(defaultValue: boolean = false): boolean {
    return this._isPauseAvailableCallback?.call(this.entity) ?? defaultValue;
  }

  private _pause(pausedAt: number, withChildren: boolean): void {
    if (this._paused || !this._isPauseAvailable(!withChildren)) {
      return;
    }

    this._paused = true;

    for (const timestamp of this._getBoundTimestamps()) {
      timestamp.pause(pausedAt);
    }

    if (withChildren) {
      for (const timeComponent of this.entity.getNestedChildrenComponents(Time)) {
        timeComponent._pause(pausedAt, false);
      }
    }

    this._afterPauseCallback?.call(this.entity);
  }

  private _unpause(unpausedAt: number, withChildren: boolean): void {
    if (!this._paused || !this._isPauseAvailable(!withChildren)) {
      return;
    }

    this._paused = false;

    for (const timestamp of this._getBoundTimestamps()) {
      timestamp.unpause(unpausedAt);
    }

    if (withChildren) {
      for (const timeComponent of this.entity.getNestedChildrenComponents(Time)) {
        timeComponent._unpause(unpausedAt, false);
      }
    }

    this._afterUnpauseCallback?.call(this.entity);
  }

  get pauseAvailable(): boolean {
    return this._isPauseAvailable();
  }

  get paused(): boolean {
    return this._paused;
  }

  createTimestamp(addMs = 0): Timestamp {
    return Entity.internalApi.wrapTimestamp(
      this.entity,
      new Timestamp({
        addMs,
      }),
    );
  }

  *delay(ms: number): EffectGenerator<void> {
    yield (resolve) => {
      const timestamp = this.createTimestamp(ms);
      const unsubscribe = timestamp.subscribe(resolve);

      this._timestamps.add(timestamp);

      return () => {
        this._timestamps.delete(timestamp);

        unsubscribe();
      };
    };
  }

  pause(pausedAt: number): void {
    this._pause(pausedAt, true);
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
    this._unpause(unpausedAt, true);
  }

  *waitForTimestamp(timestamp: Timestamp): EffectGenerator<void> {
    return yield (resolve) => {
      return timestamp.subscribe(resolve);
    };
  }
}
