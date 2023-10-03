import { useMemo } from 'react';

import { BaseGamePlayer } from 'common/types';
import { GameType } from 'common/types/game';

import useSharedStoreValue from 'client/hooks/useSharedStoreValue';

export default function usePlayer<Game extends GameType, Player extends BaseGamePlayer<Game>>(
  players: Player[],
): Player | null {
  const [user] = useSharedStoreValue('user');

  return useMemo(() => players.find(({ login }) => login === user?.login), [players, user]) ?? null;
}
