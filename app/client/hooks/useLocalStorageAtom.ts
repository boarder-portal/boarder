import { useEffect, useState } from 'react';

import LocalStorageAtom, {
  LocalStorageKey,
  LocalStorageValue,
  SetValueOptions,
} from 'client/utilities/LocalStorageAtom';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

export default function useLocalStorageAtom<Key extends LocalStorageKey>(
  atom: LocalStorageAtom<Key>,
): [LocalStorageValue<Key>, (value: LocalStorageValue<Key> | null, options?: SetValueOptions) => void] {
  const [value, setValue] = useState<LocalStorageValue<Key>>(atom.value);

  useEffect(() => {
    return atom.subscribe(setValue);
  }, [atom]);

  return [
    value,
    useImmutableCallback((value, options) => {
      atom.setValue(value, options);
    }),
  ];
}
