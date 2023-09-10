import { createContext } from 'react';

import { GameState } from 'common/types/game';

export const TimeDiffContext = createContext<() => number>(() => 0);
export const GameStateContext = createContext<GameState>({
  type: 'active',
  changeTimestamp: 0,
});
