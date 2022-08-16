import { useEffect } from 'react';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

export interface IUseLeaveOnUnmountOptions {
  onDragLeave?(): void;
  onMouseLeave?(): void;
}

export default function useLeaveOnUnmount(options: IUseLeaveOnUnmountOptions = {}): void {
  const { onDragLeave, onMouseLeave } = options;

  const immutableDragLeave = useImmutableCallback(() => {
    onDragLeave?.();
  });

  const immutableMouseLeave = useImmutableCallback(() => {
    onMouseLeave?.();
  });

  useEffect(() => {
    return () => {
      immutableDragLeave();
      immutableMouseLeave();
    };
  }, [immutableDragLeave, immutableMouseLeave]);
}
