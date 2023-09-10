import { useMemo } from 'react';

import { GamePlayer } from 'common/types';
import { GameType } from 'common/types/game';

import useAtom from 'client/hooks/useAtom';

export default function usePlayer<Game extends GameType, Player extends GamePlayer<Game>>(
  players: Player[],
): Player | null {
  const [user] = useAtom('user');

  return useMemo(() => players.find(({ login }) => login === user?.login), [players, user]) ?? null;
}
