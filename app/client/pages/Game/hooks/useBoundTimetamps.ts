import { useContext, useEffect } from 'react';

import { ITimestamp } from 'common/types';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import { GameStateContext } from 'client/pages/Game/contexts';

export default function useBoundTimestamps(getTimestamps: () => (ITimestamp | null | undefined)[]): void {
  const gameState = useContext(GameStateContext);
  const immutableGetTimestamps = useImmutableCallback(getTimestamps);

  useEffect(() => {
    immutableGetTimestamps().forEach((timestamp) => {
      if (gameState.type === 'paused') {
        timestamp?.pause?.(gameState.changeTimestamp);
      } else {
        timestamp?.unpause?.(gameState.changeTimestamp);
      }
    });
  }, [gameState.changeTimestamp, gameState.type, immutableGetTimestamps]);
}
