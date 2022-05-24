import { EGame, TGameOptions } from 'common/types/game';

export type EGameDefaultOptionsKey<Game extends EGame> = `game/${Game}/defaultOptions`;

type TGameOptionsValues = {
  [Game in EGame as EGameDefaultOptionsKey<Game>]: TGameOptions<Game>;
};

interface ILocalStorageValues extends TGameOptionsValues {}

export type TLocalStorageKey = keyof ILocalStorageValues;

export type TLocalStorageValue<Key extends TLocalStorageKey> = ILocalStorageValues[Key];

export type TLocalStorageSubscriber<Key extends TLocalStorageKey> = (value: TLocalStorageValue<Key>) => unknown;

export interface ISetValueOptions {
  refreshDefault?: boolean;
}

export default class LocalStorageAtom<Key extends TLocalStorageKey> {
  key: Key;
  defaultValue: TLocalStorageValue<Key>;
  value: TLocalStorageValue<Key>;
  subscribers = new Set<TLocalStorageSubscriber<Key>>();

  constructor(key: Key, defaultValue: TLocalStorageValue<Key>) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.value = this.getInitialValue() ?? this.defaultValue;
  }

  getInitialValue(): TLocalStorageValue<Key> | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const rawValue = localStorage.getItem(this.key);

    return rawValue && JSON.parse(rawValue);
  }

  setValue(value: TLocalStorageValue<Key> | null, options?: ISetValueOptions): void {
    if (options?.refreshDefault) {
      this.defaultValue = this.value;
    }

    this.value = value ?? this.defaultValue;

    if (typeof localStorage !== 'undefined') {
      if (value === null) {
        localStorage.removeItem(this.key);
      } else {
        localStorage.setItem(this.key, JSON.stringify(value));
      }
    }

    for (const subscriber of this.subscribers) {
      subscriber(this.value);
    }
  }

  subscribe(subscriber: TLocalStorageSubscriber<Key>): () => void {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }
}
