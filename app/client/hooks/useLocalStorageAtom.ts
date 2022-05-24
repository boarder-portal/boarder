import { useEffect, useState } from 'react';

import LocalStorageAtom, {
  ISetValueOptions,
  TLocalStorageKey,
  TLocalStorageValue,
} from 'client/utilities/LocalStorageAtom';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

export default function useLocalStorageAtom<Key extends TLocalStorageKey>(
  atom: LocalStorageAtom<Key>,
): [TLocalStorageValue<Key>, (value: TLocalStorageValue<Key> | null, options: ISetValueOptions) => void] {
  const [value, setValue] = useState<TLocalStorageValue<Key>>(atom.value);

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
