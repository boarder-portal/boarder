import React from 'react';
import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from '@material-ui/core';

interface ISelectProps {
  label: string;
  name: string;
  value: string | string[];
  options: { text: string; value: string }[];
  multiple?: boolean;
  onChange(e: React.ChangeEvent<{value: string | string[]}>): void;
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
        onChange={onChange as any}
      >
        {options.map(({ text, value }) => (
          <MenuItem key={value} value={value}>{text}</MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default React.memo(Select);
