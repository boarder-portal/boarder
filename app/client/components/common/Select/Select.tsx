import { ReactNode, useMemo } from 'react';
import classNames from 'classnames';

import Dropdown from 'client/components/common/Dropdown/Dropdown';
import Flex from 'client/components/common/Flex/Flex';
import ArrowDropDownIcon from 'client/components/icons/ArrowDropDownIcon/ArrowDropDownIcon';

import styles from './Select.pcss';

interface ISelectProps<Value> {
  className?: string;
  value: Value;
  options: {
    text: ReactNode;
    value: Value;
    disabled?: boolean;
  }[];
  label?: string;
  onChange(newValue: Value): void;
}

const Select = <Value extends string | number>(props: ISelectProps<Value>): JSX.Element => {
  const { className, value, options, label, onChange } = props;

  const selectedText = useMemo(() => options.find((option) => option.value === value)?.text, [options, value]);

  const popup = useMemo(
    () => (
      <>
        {options.map((option) => (
          <div
            key={option.value}
            className={classNames(styles.option, {
              [styles.disabled]: option.disabled,
              [styles.selected]: option.value === value,
            })}
            onClick={() => onChange(option.value)}
          >
            {option.text}
          </div>
        ))}
      </>
    ),
    [onChange, options, value],
  );

  return (
    <Dropdown
      className={classNames(styles.root, className)}
      popupClassName={styles.options}
      popup={popup}
      popupPosition="bottomLeft"
    >
      {label && <div className={styles.label}>{label}</div>}

      <Flex className={styles.trigger} justifyContent="spaceBetween" alignItems="center">
        <div>{selectedText}</div>

        <ArrowDropDownIcon className={styles.icon} />
      </Flex>
    </Dropdown>
  );
};

export default Select;
