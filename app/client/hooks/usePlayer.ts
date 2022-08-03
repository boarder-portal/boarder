import { useMemo } from 'react';

import { IGamePlayer } from 'common/types';
import { EGame } from 'common/types/game';

import useAtom from 'client/hooks/useAtom';

export default function usePlayer<Game extends EGame, Player extends IGamePlayer<Game>>(
  players: Player[],
): Player | null {
  const [user] = useAtom('user');

  return useMemo(() => players.find(({ login }) => login === user?.login), [players, user]) ?? null;
}
