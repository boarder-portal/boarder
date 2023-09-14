import { GameOptions, GameType, PlayerSettings } from 'common/types/game';

type GameOptionsValues = {
  [Game in GameType as typeof GAME_OPTIONS_KEYS[Game]]: GameOptions<Game>;
} & {
  [Game in GameType as typeof PLAYER_SETTINGS_KEYS[Game]]: PlayerSettings<Game>;
};

interface LocalStorageValues extends GameOptionsValues {}

export type LocalStorageKey = keyof LocalStorageValues;

export type LocalStorageValue<Key extends LocalStorageKey> = LocalStorageValues[Key];

export type LocalStorageSubscriber<Key extends LocalStorageKey> = (value: LocalStorageValue<Key>) => unknown;

export interface SetValueOptions {
  refreshDefault?: boolean;
}

export const GAME_OPTIONS_KEYS = {
  [GameType.PEXESO]: 'game/pexeso/defaultOptions/v1',
  [GameType.SURVIVAL_ONLINE]: 'game/survivalOnline/defaultOptions/v1',
  [GameType.SET]: 'game/set/defaultOptions/v1',
  [GameType.ONITAMA]: 'game/onitama/defaultOptions/v1',
  [GameType.CARCASSONNE]: 'game/carcassonne/defaultOptions/v1.1',
  [GameType.SEVEN_WONDERS]: 'game/sevenWonders/defaultOptions/v2',
  [GameType.HEARTS]: 'game/hearts/defaultOptions/v1',
  [GameType.BOMBERS]: 'game/bombers/defaultOptions/v2',
  [GameType.MACHI_KORO]: 'game/machiKoro/defaultOptions/v1',
  [GameType.MAHJONG]: 'game/mahjong/defaultOptions/v1',
  [GameType.RED_SEVEN]: 'game/redSeven/defaultOptions/v1.2',
} as const;

export const PLAYER_SETTINGS_KEYS = {
  [GameType.PEXESO]: 'game/pexeso/playerSettings/v1',
  [GameType.SURVIVAL_ONLINE]: 'game/survivalOnline/playerSettings/v1',
  [GameType.SET]: 'game/set/playerSettings/v1',
  [GameType.ONITAMA]: 'game/onitama/playerSettings/v1',
  [GameType.CARCASSONNE]: 'game/carcassonne/playerSettings/v1',
  [GameType.SEVEN_WONDERS]: 'game/sevenWonders/playerSettings/v1',
  [GameType.HEARTS]: 'game/hearts/playerSettings/v1',
  [GameType.BOMBERS]: 'game/bombers/playerSettings/v1',
  [GameType.MACHI_KORO]: 'game/machiKoro/playerSettings/v1',
  [GameType.MAHJONG]: 'game/mahjong/playerSettings/v1.3',
  [GameType.RED_SEVEN]: 'game/redSeven/playerSettings/v1',
} as const;

export default class LocalStorageAtom<Key extends LocalStorageKey> {
  key: Key;
  defaultValue: LocalStorageValue<Key>;
  value: LocalStorageValue<Key>;
  subscribers = new Set<LocalStorageSubscriber<Key>>();

  constructor(key: Key, defaultValue: LocalStorageValue<Key>) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.value = this.getInitialValue() ?? this.defaultValue;
  }

  getInitialValue(): LocalStorageValue<Key> | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const rawValue = localStorage.getItem(this.key);

    return rawValue && JSON.parse(rawValue);
  }

  setValue(value: LocalStorageValue<Key> | null, options?: SetValueOptions): void {
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

  subscribe(subscriber: LocalStorageSubscriber<Key>): () => void {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }
}
