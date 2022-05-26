import React from 'react';
import classNames from 'classnames';

import Flex from 'client/components/common/Flex/Flex';

import styles from './RadioGroup.pcss';

interface IRadioGroupProps<Value> {
  value: Value;
  options: {
    text: React.ReactNode;
    value: Value;
    disabled?: boolean;
  }[];
  onChange(newValue: Value): void;
}

const RadioGroup = <Value extends number | string>(props: IRadioGroupProps<Value>): JSX.Element => {
  const { value, options, onChange } = props;

  return (
    <Flex direction="column" between={2}>
      {options.map((option) => (
        <Flex
          key={option.value}
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
