import { useEffect } from 'react';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

export interface UseLeaveOnUnmountOptions {
  onDragLeave?(): void;
  onMouseLeave?(): void;
}

export default function useLeaveOnUnmount(options: UseLeaveOnUnmountOptions = {}): void {
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
