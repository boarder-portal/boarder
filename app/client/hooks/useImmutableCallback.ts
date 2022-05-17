import { useCallback, useRef } from 'react';

export default function useImmutableCallback<Func extends (...props: any[]) => any>(callback: Func): Func {
  const connectedRef = useRef(callback);

  connectedRef.current = callback;

  return useCallback(((...args: any[]) => connectedRef.current(...args)) as any, []);
}
