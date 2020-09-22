import React, { useCallback } from 'react';
import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from '@material-ui/core';

import typedReactMemo from 'client/types/typedReactMemo';

interface ISelectCommonProps {
  label: string;
  name: string;
}

interface ISelectSingleProps<Value> extends ISelectCommonProps {
  value: Value;
  options: { text: React.ReactNode; value: Value }[];
  multiple?: false;
  onChange(newValue: Value): void;
}

interface ISelectMultipleProps<Value> extends ISelectCommonProps {
  value: Value[];
  options: { text: React.ReactNode; value: Value }[];
  multiple: true;
  onChange(newValue: Value[]): void;
}

type TSelectProps<Value> = ISelectSingleProps<Value> | ISelectMultipleProps<Value>;

const Select = <Value extends string | number>(props: TSelectProps<Value>) => {
  const {
    label,
    name,
    value,
    options,
    multiple = false,
    onChange,
  } = props;

  const handleChange = useCallback((e: React.ChangeEvent<{value: unknown}>) => {
    onChange(e.target.value as any);
  }, [onChange]);

  return (
    <FormControl className="fromBlock">
      <InputLabel id={name}>{label}</InputLabel>

      <MuiSelect
        labelId={name}
        value={value}
        multiple={multiple}
        MenuProps={{
          disableAutoFocusItem: true,
          getContentAnchorEl: null,
        }}
        onChange={handleChange}
      >
        {options.map(({ text, value }) => (
          <MenuItem key={value} value={value}>
            {text}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default typedReactMemo(Select);
