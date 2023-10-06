import { useCallback, useContext } from 'react';

import { Timestamp as TimestampModel } from 'common/types';

import Timestamp from 'common/utilities/Timestamp';
import { now } from 'common/utilities/time';

import { TimeDiffContext } from 'client/components/game/Game/contexts';

export interface TimestampOptions {
  addMs: number | null;
  pausedAt?: number;
}

export default function useCreateTimestamp(): (
  serverTimestampOrOptions?: TimestampModel | TimestampOptions,
) => Timestamp {
  const getTimeDiff = useContext(TimeDiffContext);

  return useCallback(
    (serverTimestampOrOptions) => {
      let addMs: number | undefined;
      let pausedAt: number | undefined;

      if (!serverTimestampOrOptions || 'addMs' in serverTimestampOrOptions) {
        addMs = serverTimestampOrOptions?.addMs ?? undefined;
        pausedAt = serverTimestampOrOptions?.pausedAt ?? undefined;
      } else {
        addMs = serverTimestampOrOptions.value - getTimeDiff() - now();
        pausedAt =
          serverTimestampOrOptions.pausedAt === null ? undefined : serverTimestampOrOptions.pausedAt - getTimeDiff();
      }

      return new Timestamp({
        addMs,
        pausedAt,
      });
    },
    [getTimeDiff],
  );
}
