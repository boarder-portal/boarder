import React, { useCallback } from 'react';
import TextField from '@material-ui/core/TextField';

interface IInputProps {
  className?: string;
  label: string;
  value: string;
  type?: 'text' | 'password';
  onChange(newValue: string): void;
}

const Input: React.FC<IInputProps> = (props) => {
  const { className, value, label, type = 'text', onChange } = props;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return <TextField className={className} value={value} label={label} type={type} onChange={handleChange} />;
};

export default React.memo(Input);
