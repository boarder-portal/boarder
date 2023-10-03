import { useContext, useEffect, useState } from 'react';

import { SharedStoreContext, SharedStoreKey, SharedStoreValue } from 'common/utilities/SharedStore';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

export type UseSharedStoreValue<Key extends SharedStoreKey> = [
  SharedStoreValue<Key>,
  (value: SharedStoreValue<Key> | ((value: SharedStoreValue<Key>) => SharedStoreValue<Key>)) => void,
];

export default function useSharedStoreValue<Key extends SharedStoreKey>(key: Key): UseSharedStoreValue<Key> {
  const sharedStore = useContext(SharedStoreContext);

  const [value, setValue] = useState<SharedStoreValue<Key>>(sharedStore.getValue(key));

  useEffect(() => {
    return sharedStore.subscribe((changedKey, newValue) => {
      // @ts-ignore
      if (changedKey === key) {
        setValue(newValue);
      }
    });
  }, [key, sharedStore]);

  return [
    value,
    useImmutableCallback((value) => {
      sharedStore.setValue(key, value);
    }),
  ];
}
