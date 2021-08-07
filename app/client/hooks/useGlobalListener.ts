import { useEffect, useRef } from 'react';

export default function useGlobalListener<
  T extends Document | Window,
  M extends T extends Document ? DocumentEventMap : WindowEventMap,
  K extends keyof M,
>(
  type: K,
  target: T,
  listener: (event: M[K]) => void,
) {
  const listenerRef = useRef<(event: M[K]) => void>(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const localListener = (e: M[K]) => {
      listenerRef.current(e);
    };

    target.addEventListener(type as any, localListener as any);

    return () => {
      target.removeEventListener(type as any, localListener as any);
    };
  }, [type, target]);
}
