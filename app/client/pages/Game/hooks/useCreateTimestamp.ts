import { useCallback, useContext } from 'react';

import { ITimestamp } from 'common/types';

import Timestamp from 'common/utilities/Timestamp';
import { now } from 'client/utilities/time';

import { TimeDiffContext } from 'client/pages/Game/contexts';

export interface ITimestampOptions {
  addMs: number | null;
  pausedAt?: number;
}

export default function useCreateTimestamp(): (serverTimestampOrOptions?: ITimestamp | ITimestampOptions) => Timestamp {
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
