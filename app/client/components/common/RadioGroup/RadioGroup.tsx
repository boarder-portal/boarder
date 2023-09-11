import classNames from 'classnames';
import { ReactNode } from 'react';

import Flex from 'client/components/common/Flex/Flex';

import styles from './RadioGroup.module.scss';

export interface SelectOption<Value> {
  text: ReactNode;
  value: Value;
  disabled?: boolean;
}

interface RadioGroupProps<Value> {
  value: Value;
  options: SelectOption<Value>[];
  onChange(newValue: Value): void;
}

const RadioGroup = <Value extends unknown>(props: RadioGroupProps<Value>) => {
  const { value, options, onChange } = props;

  return (
    <Flex direction="column" between={2}>
      {options.map((option) => (
        <Flex
          key={String(option.value)}
          className={classNames(styles.option, { [styles.disabled]: option.disabled })}
          alignItems="center"
          between={2}
          onClick={() => onChange(option.value)}
        >
          <div className={classNames(styles.circle, { [styles.selected]: option.value === value })} />

          <div>{option.text}</div>
        </Flex>
      ))}
    </Flex>
  );
};

export default RadioGroup;
