import React, { useCallback } from 'react';
import MuiCheckbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

interface ICheckboxProps {
  className?: string;
  checked: boolean;
  label: string;
  onChange(newValue: boolean): void;
}

const Checkbox: React.FC<ICheckboxProps> = (props) => {
  const {
    className,
    checked,
    label,
    onChange,
  } = props;

  const onCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  }, [onChange]);

  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          className={className}
          checked={checked}
          onChange={onCheckboxChange}
        />
      }
      label={label}
    />
  );
};

export default React.memo(Checkbox);
