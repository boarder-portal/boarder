import { useContext, useEffect } from 'react';

import Timestamp from 'common/utilities/Timestamp';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import { GameStateContext } from 'client/components/game/Game/contexts';

export default function useBoundTimestamps(getTimestamps: () => (Timestamp | null | undefined)[]): void {
  const gameState = useContext(GameStateContext);
  const immutableGetTimestamps = useImmutableCallback(getTimestamps);

  useEffect(() => {
    immutableGetTimestamps().forEach((timestamp) => {
      if (gameState.type === 'paused') {
        timestamp?.pause(gameState.changeTimestamp);
      } else {
        timestamp?.unpause(gameState.changeTimestamp);
      }
    });
  }, [gameState.changeTimestamp, gameState.type, immutableGetTimestamps]);
}
