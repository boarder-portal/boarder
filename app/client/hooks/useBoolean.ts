import { useCallback, useState } from 'react';

export interface UseBoolean {
  value: boolean;
  setValue(value: boolean | ((value: boolean) => boolean)): void;
  toggle(): void;
  setTrue(): void;
  setFalse(): void;
}

export default function useBoolean(init: boolean): UseBoolean {
  const [value, setValue] = useState(init);

  return {
    value,
    setValue,
    toggle: useCallback(() => setValue((stateValue) => !stateValue), []),
    setTrue: useCallback(() => setValue(true), []),
    setFalse: useCallback(() => setValue(false), []),
  };
}
