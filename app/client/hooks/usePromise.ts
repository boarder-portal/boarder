import { useEffect, useRef, useState } from 'react';

import { AnyAsyncValue } from 'client/types/async';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

export type UsePromise<Result, Args extends unknown[]> = AnyAsyncValue<Result> & {
  run(...args: Args): Promise<Result>;
};

export default function usePromise<Result, Args extends unknown[]>(
  getPromise: (signal: AbortSignal, ...args: Args) => Promise<Result>,
): UsePromise<Result, Args> {
  const [promiseValue, setPromiseValue] = useState<AnyAsyncValue<Result>>({
    value: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...promiseValue,
    run: useImmutableCallback(async (...args) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();

      abortControllerRef.current = controller;

      try {
        setPromiseValue({
          value: null,
          isLoading: true,
          isSuccess: false,
          isError: false,
          error: null,
        });

        const result = await getPromise(controller.signal, ...args);

        setPromiseValue({
          value: result,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });

        return result;
      } catch (err) {
        setPromiseValue({
          value: null,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: err,
        });

        throw err;
      }
    }),
  };
}
