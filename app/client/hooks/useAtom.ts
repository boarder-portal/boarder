import { useCallback, useContext, useEffect, useState } from 'react';

import { IState, StoreContext } from 'client/utilities/store';

export default function useAtom<Key extends keyof IState>(key: Key): [IState[Key], (v: IState[Key]) => void] {
  const store = useContext(StoreContext);
  const [value, setValue] = useState<IState[Key]>(store.value[key]);

  useEffect(() => {
    store.listeners[key].push(setValue);

    return () => {
      store.listeners[key].splice(store.listeners[key].indexOf(setValue), 1);
    };
  }, [key, store.listeners]);

  const setAtomValue = useCallback(
    (value: IState[Key]) => {
      store.value[key] = value;

      store.listeners[key].forEach((listener) => {
        listener(value);
      });
    },
    [key, store.listeners, store.value],
  );

  return [value, setAtomValue];
}
