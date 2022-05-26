import { createContext } from 'react';

import { IUser } from 'common/types';

export interface IState {
  user: IUser | null;
}

export interface IAtomListener {
  (value: any): void;
}

type TListeners = Record<keyof IState, IAtomListener[]>;

export interface IStore {
  value: IState;
  listeners: TListeners;
}

export function getInitialState(): IState {
  return {
    user: null,
  };
}

export const StoreContext = createContext<IStore>({} as IStore);

export default function createStore(initialState: IState): IStore {
  return {
    value: initialState,
    listeners: Object.keys(initialState).reduce<TListeners>((listeners, key) => {
      return {
        ...listeners,
        [key]: [],
      };
    }, {} as TListeners),
  };
}
