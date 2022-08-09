import { ITimestamp } from 'common/types';

export type TSubscriber = () => unknown;

export interface ITimestampOptions {
  addMs: number | null;
  pausedAt?: number | null;
  now: () => number;
}

export default class Timestamp implements ITimestamp {
  #value: number;
  #pausedAt: number | null;
  #now: () => number;
  #runTimer: NodeJS.Timeout | undefined;
  #subscribers = new Set<TSubscriber>();

  constructor(options: ITimestampOptions) {
    this.#value = options.now() + (options.addMs ?? 0);
    this.#pausedAt = options.pausedAt ?? null;
    this.#now = options.now;

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
    return this.#value - (this.#pausedAt ?? this.#now());
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

  subscribe(callback: TSubscriber): () => void {
    this.#subscribers.add(callback);

    return () => {
      this.#subscribers.delete(callback);
    };
  }

  toJSON(): ITimestamp {
    return {
      value: this.value,
      pausedAt: this.pausedAt,
      timeLeft: this.timeLeft,
      timePassed: this.timePassed,
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
