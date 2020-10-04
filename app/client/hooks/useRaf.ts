import { useEffect, useRef } from 'react';

type RafCallback = (timePassed: number) => false | void;

export default function useRaf(callback: RafCallback) {
  const callbackRef = useRef<RafCallback>(callback);
  const timestampRef = useRef<number | null>(null);
  const ended = useRef<boolean>(false);

  callbackRef.current = callback;

  useEffect(() => {
    let frameId: number | null = null;

    const step = (time: number) => {
      if (ended) {
        return;
      }

      if (timestampRef.current === null) {
        timestampRef.current = time;
      }

      const returnValue = callbackRef.current(time - timestampRef.current);

      timestampRef.current = time;

      if (returnValue !== false) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => {
      ended.current = true;

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);
}
