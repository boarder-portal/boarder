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
  private _values: SharedStoreValues = {
    user: null,
  };
  private _subscribers = new Set<SharedStoreSubscriber>();

  constructor(json?: Partial<SharedStoreValues>) {
    if (json) {
      forEach(json, (value, key) => {
        if (value !== undefined) {
          this._values[key as SharedStoreKey] = value;
        }
      });
    }
  }

  getValue<Key extends SharedStoreKey>(key: Key): SharedStoreValue<Key> {
    return this._values[key];
  }

  setValue<Key extends SharedStoreKey>(
    key: Key,
    value: SharedStoreValue<Key> | ((value: SharedStoreValue<Key>) => SharedStoreValue<Key>),
  ): void {
    const newValue = typeof value === 'function' ? value(this._values[key]) : value;

    this._values[key] = newValue;

    for (const subscriber of this._subscribers) {
      subscriber(key, newValue);
    }
  }

  subscribe(subscriber: SharedStoreSubscriber): () => void {
    this._subscribers.add(subscriber);

    return () => {
      this._subscribers.delete(subscriber);
    };
  }

  toJSON(): SharedStoreValues {
    return this._values;
  }
}

export const SharedStoreContext = createContext<SharedStore>(new SharedStore());
