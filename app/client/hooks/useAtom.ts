import { useCallback, useContext, useEffect, useState } from 'react';

import { State, StoreContext } from 'client/utilities/store';

export default function useAtom<Key extends keyof State>(key: Key): [State[Key], (v: State[Key]) => void] {
  const store = useContext(StoreContext);
  const [value, setValue] = useState<State[Key]>(store.value[key]);

  useEffect(() => {
    store.listeners[key].push(setValue);

    return () => {
      store.listeners[key].splice(store.listeners[key].indexOf(setValue), 1);
    };
  }, [key, store.listeners]);

  const setAtomValue = useCallback(
    (value: State[Key]) => {
      store.value[key] = value;

      store.listeners[key].forEach((listener) => {
        listener(value);
      });
    },
    [key, store.listeners, store.value],
  );

  return [value, setAtomValue];
}
