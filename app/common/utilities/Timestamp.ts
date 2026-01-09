import { Timestamp as TimestampModel } from 'common/types';

import { now } from 'common/utilities/time';

export type Subscriber = () => unknown;

export interface TimestampOptions {
  addMs?: number;
  pausedAt?: number | null;
}

export default class Timestamp implements TimestampModel {
  private _value: number;
  private _pausedAt: number | null;
  private _runTimer: NodeJS.Timeout | undefined;
  private _subscribers = new Set<Subscriber>();

  constructor(options: TimestampOptions) {
    this._value = now() + (options.addMs ?? 0);
    this._pausedAt = options.pausedAt ?? null;

    this._setTimer();
  }

  private _setTimer(): void {
    this._runTimer = setTimeout(() => {
      for (const subscriber of this._subscribers) {
        subscriber();
      }
    }, this.timeLeft);
  }

  get value(): number {
    return this._value;
  }

  get pausedAt(): number | null {
    return this._pausedAt;
  }

  get timeLeft(): number {
    return this._value - (this._pausedAt ?? now());
  }

  get timePassed(): number {
    return -this.timeLeft;
  }

  pause(pausedAt: number): void {
    if (this._pausedAt !== null) {
      return;
    }

    this._pausedAt = pausedAt;

    if (this._runTimer) {
      clearTimeout(this._runTimer);
    }
  }

  subscribe(callback: Subscriber): () => void {
    this._subscribers.add(callback);

    return () => {
      this._subscribers.delete(callback);
    };
  }

  toJSON(): TimestampModel {
    return {
      value: this._value,
      pausedAt: this._pausedAt,
    };
  }

  unpause(unpausedAt: number): void {
    if (this._pausedAt === null) {
      return;
    }

    this._value += unpausedAt - this._pausedAt;
    this._pausedAt = null;

    this._setTimer();
  }
}
