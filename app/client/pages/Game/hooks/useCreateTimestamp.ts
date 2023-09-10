import { useCallback, useContext } from 'react';

import { Timestamp as TimestampModel } from 'common/types';

import { now } from 'client/utilities/time';
import Timestamp from 'common/utilities/Timestamp';

import { TimeDiffContext } from 'client/pages/Game/contexts';

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
      let addMs: number | null;
      let pausedAt: number | null | undefined;

      if (!serverTimestampOrOptions || 'addMs' in serverTimestampOrOptions) {
        addMs = serverTimestampOrOptions?.addMs ?? null;
        pausedAt = serverTimestampOrOptions?.pausedAt ?? null;
      } else {
        addMs = serverTimestampOrOptions.value - getTimeDiff() - now();
        pausedAt =
          serverTimestampOrOptions.pausedAt === null ? null : serverTimestampOrOptions.pausedAt - getTimeDiff();
      }

      return new Timestamp({
        addMs,
        pausedAt,
        now,
      });
    },
    [getTimeDiff],
  );
}
