import React, { useCallback } from 'react';
import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from '@material-ui/core';

import typedReactMemo from 'client/types/typedReactMemo';

interface ISelectCommonProps<Value> {
  label?: string;
  name: string;
  options: {
    text: React.ReactNode;
    value: Value;
    disabled?: boolean;
  }[];
  style?: React.CSSProperties;
}

interface ISelectSingleProps<Value> extends ISelectCommonProps<Value> {
  value: Value;
  multiple?: false;
  onChange(newValue: Value): void;
}

interface ISelectMultipleProps<Value> extends ISelectCommonProps<Value> {
  value: Value[];
  multiple: true;
  onChange(newValue: Value[]): void;
}

type TSelectProps<Value> = ISelectSingleProps<Value> | ISelectMultipleProps<Value>;

const Select = <Value extends string | number>(props: TSelectProps<Value>) => {
  const { label, name, value, options, style, multiple = false, onChange } = props;

  const handleChange = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      onChange(e.target.value as any);
    },
    [onChange],
  );

  return (
    // FIXME: wtf is fromBlock
    <FormControl className="fromBlock" style={style}>
      {label && <InputLabel id={name}>{label}</InputLabel>}

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
        {options.map(({ text, value, disabled }) => (
          <MenuItem key={value} value={value} disabled={disabled}>
            {text}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default typedReactMemo(Select);
