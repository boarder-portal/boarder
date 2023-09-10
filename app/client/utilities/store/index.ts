import { createContext } from 'react';

import { User } from 'common/types';

export interface State {
  user: User | null;
}

export interface AtomListener {
  (value: any): void;
}

type Listeners = Record<keyof State, AtomListener[]>;

export interface Store {
  value: State;
  listeners: Listeners;
}

export function getInitialState(): State {
  return {
    user: null,
  };
}

export const StoreContext = createContext<Store>({} as Store);

export default function createStore(initialState: State): Store {
  return {
    value: initialState,
    listeners: Object.keys(initialState).reduce<Listeners>((listeners, key) => {
      return {
        ...listeners,
        [key]: [],
      };
    }, {} as Listeners),
  };
}
