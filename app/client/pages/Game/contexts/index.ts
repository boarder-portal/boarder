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

export const PlayerSettingsContexts = mapValues(mapKeys(GameType), (game) => createContext(PLAYER_SETTINGS[game])) as {
  [Game in GameType]: Context<PlayerSettings<Game>>;
};
