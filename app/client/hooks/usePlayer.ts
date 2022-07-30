import { useMemo } from 'react';

import { IGamePlayer } from 'common/types';

import useAtom from 'client/hooks/useAtom';

export default function usePlayer<Player extends IGamePlayer>(players: Player[]): Player | null {
  const [user] = useAtom('user');

  return useMemo(() => players.find(({ login }) => login === user?.login), [players, user]) ?? null;
}
