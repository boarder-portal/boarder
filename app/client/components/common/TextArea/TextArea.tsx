import React, { useCallback } from 'react';
import TextField from '@material-ui/core/TextField';

interface IInputProps {
  className?: string;
  label: string;
  value: string;
  rows: number;
  onChange(newValue: string): void;
}

const TextArea: React.FC<IInputProps> = (props) => {
  const { className, value, label, rows, onChange } = props;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <TextField
      className={className}
      value={value}
      label={label}
      rows={rows}
      multiline
      onChange={handleChange}
    />
  );
};

export default React.memo(TextArea);
