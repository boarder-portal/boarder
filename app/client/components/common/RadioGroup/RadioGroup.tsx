import React, { useCallback } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import MuiRadioGroup from '@material-ui/core/RadioGroup';

import typedReactMemo from 'client/types/typedReactMemo';

interface IRadioGroupProps<Value> {
  options: {
    text: React.ReactNode;
    value: Value;
    disabled?: boolean;
  }[];
  value: Value;
  onChange(newValue: Value): void;
}

const RadioGroup = <Value extends number | string>(props: IRadioGroupProps<Value>) => {
  const {
    options,
    value,
    onChange,
  } = props;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value as any);
  }, [onChange]);

  return (
    <MuiRadioGroup value={value} onChange={handleChange}>
      {options.map(({ text, value, disabled }) => (
        <FormControlLabel
          key={value}
          value={value}
          control={<Radio value={value} />}
          label={text}
          disabled={disabled}
        />
      ))}
    </MuiRadioGroup>
  );
};

export default typedReactMemo(RadioGroup);
