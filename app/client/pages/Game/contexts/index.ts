import { createContext } from 'react';

import { IGameState } from 'common/types/game';

export const TimeDiffContext = createContext<() => number>(() => 0);
export const GameStateContext = createContext<IGameState>({
  type: 'active',
  changeTimestamp: 0,
});
