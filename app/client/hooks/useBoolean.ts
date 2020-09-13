import { useCallback, useState } from 'react';

export function useBoolean(init: boolean) {
  const [value, setValue] = useState(init);

  return {
    value,
    setValue,
    toggle: useCallback(() => setValue((stateValue) => !stateValue), []),
    setTrue: useCallback(() => setValue(true), []),
    setFalse: useCallback(() => setValue(false), []),
  };
}
