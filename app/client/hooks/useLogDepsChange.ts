import isEmpty from 'lodash/isEmpty';
import { useEffect, useRef } from 'react';

export default function useLogDepsChange(deps: unknown[]): void {
  const prevDeps = useRef<unknown[]>(deps);

  useEffect(() => {
    const changes: Record<number, unknown> = {};

    deps.forEach((dep, index) => {
      if (prevDeps.current[index] !== dep) {
        changes[index] = {
          prev: prevDeps.current[index],
          curr: dep,
        };
      }
    });

    if (!isEmpty(changes)) {
      console.log(changes);
    }

    prevDeps.current = deps;
  }, [deps]);
}
