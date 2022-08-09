import { EGame, TGameOptions, TPlayerSettings } from 'common/types/game';

type TGameOptionsValues = {
  [Game in EGame as typeof GAME_OPTIONS_KEYS[Game]]: TGameOptions<Game>;
} & {
  [Game in EGame as typeof PLAYER_SETTINGS_KEYS[Game]]: TPlayerSettings<Game>;
};

interface ILocalStorageValues extends TGameOptionsValues {}

export type TLocalStorageKey = keyof ILocalStorageValues;

export type TLocalStorageValue<Key extends TLocalStorageKey> = ILocalStorageValues[Key];

export type TLocalStorageSubscriber<Key extends TLocalStorageKey> = (value: TLocalStorageValue<Key>) => unknown;

export interface ISetValueOptions {
  refreshDefault?: boolean;
}

export const GAME_OPTIONS_KEYS = {
  [EGame.PEXESO]: 'game/pexeso/defaultOptions/v1',
  [EGame.SURVIVAL_ONLINE]: 'game/survivalOnline/defaultOptions/v1',
  [EGame.SET]: 'game/set/defaultOptions/v1',
  [EGame.ONITAMA]: 'game/onitama/defaultOptions/v1',
  [EGame.CARCASSONNE]: 'game/carcassonne/defaultOptions/v1',
  [EGame.SEVEN_WONDERS]: 'game/sevenWonders/defaultOptions/v1',
  [EGame.HEARTS]: 'game/hearts/defaultOptions/v1',
  [EGame.BOMBERS]: 'game/bombers/defaultOptions/v2',
  [EGame.MACHI_KORO]: 'game/machiKoro/defaultOptions/v1',
  [EGame.MAHJONG]: 'game/mahjong/defaultOptions/v1',
} as const;

export const PLAYER_SETTINGS_KEYS = {
  [EGame.PEXESO]: 'game/pexeso/playerSettings/v1',
  [EGame.SURVIVAL_ONLINE]: 'game/survivalOnline/playerSettings/v1',
  [EGame.SET]: 'game/set/playerSettings/v1',
  [EGame.ONITAMA]: 'game/onitama/playerSettings/v1',
  [EGame.CARCASSONNE]: 'game/carcassonne/playerSettings/v1',
  [EGame.SEVEN_WONDERS]: 'game/sevenWonders/playerSettings/v1',
  [EGame.HEARTS]: 'game/hearts/playerSettings/v1',
  [EGame.BOMBERS]: 'game/bombers/playerSettings/v1',
  [EGame.MACHI_KORO]: 'game/machiKoro/playerSettings/v1',
  [EGame.MAHJONG]: 'game/mahjong/playerSettings/v1',
} as const;

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
