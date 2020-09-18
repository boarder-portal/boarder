import React, { useCallback } from 'react';
import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from '@material-ui/core';

interface ISelectProps {
  label: string;
  name: string;
  value: string | string[];
  options: { text: string; value: string }[];
  multiple?: boolean;
  onChange(newValue: string | string[]): void;
}

const Select: React.FC<ISelectProps> = (props) => {
  const {
    label,
    name,
    value,
    options,
    multiple = false,
    onChange,
  } = props;

  const handleChange = useCallback((e: React.ChangeEvent<{value: string | string[]}>) => {
    onChange(e.target.value);
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
        onChange={handleChange as any}
      >
        {options.map(({ text, value }) => (
          <MenuItem key={value} value={value}>{text}</MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default React.memo(Select);
