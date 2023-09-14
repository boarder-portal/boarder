import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import { Context, createContext } from 'react';

import { PLAYER_SETTINGS } from 'common/constants/game';

import { GameState, GameType, PlayerSettings } from 'common/types/game';

export const TimeDiffContext = createContext<() => number>(() => 0);
export const GameStateContext = createContext<GameState>({
  type: 'active',
  changeTimestamp: 0,
});

export interface PlayerSettingsContext<Game extends GameType> {
  settings: PlayerSettings<Game>;
  changeSetting<Key extends keyof PlayerSettings<Game>>(key: Key, value: PlayerSettings<Game>[Key]): void;
}

export const PlayerSettingsContexts = mapValues(mapKeys(GameType), (game) =>
  createContext({
    settings: PLAYER_SETTINGS[game],
    changeSetting() {},
  } as PlayerSettingsContext<typeof game>),
) as {
  [Game in GameType]: Context<PlayerSettingsContext<Game>>;
};
