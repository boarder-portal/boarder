import { useCallback, useState } from 'react';

export interface IUseBoolean {
  value: boolean;
  setValue(value: boolean): void;
  toggle(): void;
  setTrue(): void;
  setFalse(): void;
}

export function useBoolean(init: boolean): IUseBoolean {
  const [value, setValue] = useState(init);

  return {
    value,
    setValue,
    toggle: useCallback(() => setValue((stateValue) => !stateValue), []),
    setTrue: useCallback(() => setValue(true), []),
    setFalse: useCallback(() => setValue(false), []),
  };
}
