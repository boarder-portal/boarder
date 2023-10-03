import forEach from 'lodash/forEach';
import { createContext } from 'react';

import { User } from 'common/types';

export interface SharedStoreValues {
  user: User | null;
}

export type SharedStoreKey = keyof SharedStoreValues;

export type SharedStoreValue<Key extends SharedStoreKey> = SharedStoreValues[Key];

export type SharedStoreSubscriber = <Key extends SharedStoreKey>(key: Key, value: SharedStoreValue<Key>) => unknown;

export default class SharedStore {
  #values: SharedStoreValues = {
    user: null,
  };
  #subscribers = new Set<SharedStoreSubscriber>();

  constructor(json?: Partial<SharedStoreValues>) {
    if (json) {
      forEach(json, (value, key) => {
        if (value !== undefined) {
          this.#values[key as SharedStoreKey] = value;
        }
      });
    }
  }

  getValue<Key extends SharedStoreKey>(key: Key): SharedStoreValue<Key> {
    return this.#values[key];
  }

  setValue<Key extends SharedStoreKey>(
    key: Key,
    value: SharedStoreValue<Key> | ((value: SharedStoreValue<Key>) => SharedStoreValue<Key>),
  ): void {
    const newValue = typeof value === 'function' ? value(this.#values[key]) : value;

    this.#values[key] = newValue;

    for (const subscriber of this.#subscribers) {
      subscriber(key, newValue);
    }
  }

  subscribe(subscriber: SharedStoreSubscriber): () => void {
    this.#subscribers.add(subscriber);

    return () => {
      this.#subscribers.delete(subscriber);
    };
  }

  toJSON(): SharedStoreValues {
    return this.#values;
  }
}

export const SharedStoreContext = createContext<SharedStore>(new SharedStore());
