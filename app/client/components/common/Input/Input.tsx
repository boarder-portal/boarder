import { ChangeEvent, FC, InputHTMLAttributes, useCallback } from 'react';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Input.pcss';

interface IInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  className?: string;
  label: string;
  value: string;
  onChange(newValue: string): void;
}

const Input: FC<IInputProps> = (props) => {
  const { className, label, onChange, ...restProps } = props;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <Flex className={className} direction="column" between={1}>
      <div>{label}</div>

      <input className={styles.input} onChange={handleChange} {...restProps} />
    </Flex>
  );
};

export default Input;
