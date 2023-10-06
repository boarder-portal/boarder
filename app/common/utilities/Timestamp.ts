import { Timestamp as TimestampModel } from 'common/types';

import { now } from 'common/utilities/time';

export type Subscriber = () => unknown;

export interface TimestampOptions {
  addMs?: number;
  pausedAt?: number | null;
}

export default class Timestamp implements TimestampModel {
  #value: number;
  #pausedAt: number | null;
  #runTimer: NodeJS.Timeout | undefined;
  #subscribers = new Set<Subscriber>();

  constructor(options: TimestampOptions) {
    this.#value = now() + (options.addMs ?? 0);
    this.#pausedAt = options.pausedAt ?? null;

    this.#setTimer();
  }

  #setTimer(): void {
    this.#runTimer = setTimeout(() => {
      for (const subscriber of this.#subscribers) {
        subscriber();
      }
    }, this.timeLeft);
  }

  get value(): number {
    return this.#value;
  }

  get pausedAt(): number | null {
    return this.#pausedAt;
  }

  get timeLeft(): number {
    return this.#value - (this.#pausedAt ?? now());
  }

  get timePassed(): number {
    return -this.timeLeft;
  }

  pause(pausedAt: number): void {
    if (this.#pausedAt !== null) {
      return;
    }

    this.#pausedAt = pausedAt;

    if (this.#runTimer) {
      clearTimeout(this.#runTimer);
    }
  }

  subscribe(callback: Subscriber): () => void {
    this.#subscribers.add(callback);

    return () => {
      this.#subscribers.delete(callback);
    };
  }

  toJSON(): TimestampModel {
    return {
      value: this.value,
      pausedAt: this.pausedAt,
    };
  }

  unpause(unpausedAt: number): void {
    if (this.#pausedAt === null) {
      return;
    }

    this.#value += unpausedAt - this.#pausedAt;
    this.#pausedAt = null;

    this.#setTimer();
  }
}
