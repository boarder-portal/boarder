import classNames from 'classnames';
import { ReactNode, useCallback, useMemo } from 'react';

import { WithClassName } from 'client/types/react';

import useBoolean from 'client/hooks/useBoolean';

import Dropdown from 'client/components/common/Dropdown/Dropdown';
import Flex from 'client/components/common/Flex/Flex';
import ArrowDropDownIcon from 'client/components/common/icons/ArrowDropDownIcon/ArrowDropDownIcon';

import styles from './Select.module.scss';

interface SelectProps<Value> extends WithClassName {
  value: Value;
  options: {
    text: ReactNode;
    value: Value;
    disabled?: boolean;
  }[];
  disabled?: boolean;
  label?: string;
  onChange(newValue: Value): void;
}

const Select = <Value extends string | number>(props: SelectProps<Value>): JSX.Element => {
  const { className, value, options, disabled, label, onChange } = props;

  const { value: dropdownOpen, setFalse: closeDropdown, setValue } = useBoolean(false);

  const selectedText = useMemo(() => options.find((option) => option.value === value)?.text, [options, value]);

  const handleSelectOption = useCallback(
    (value: Value) => {
      onChange(value);
      closeDropdown();
    },
    [closeDropdown, onChange],
  );

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
            onClick={() => handleSelectOption(option.value)}
          >
            {option.text}
          </div>
        ))}
      </>
    ),
    [handleSelectOption, options, value],
  );

  return (
    <Dropdown
      className={classNames(styles.root, className)}
      open={dropdownOpen}
      disabled={disabled}
      popupClassName={styles.options}
      popup={popup}
      popupPosition="bottomLeft"
      onChangeVisibility={setValue}
    >
      {label && <div className={styles.label}>{label}</div>}

      <Flex
        className={classNames(styles.trigger, { [styles.disabled]: disabled })}
        justifyContent="spaceBetween"
        alignItems="center"
      >
        <div>{selectedText}</div>

        <ArrowDropDownIcon className={styles.icon} />
      </Flex>
    </Dropdown>
  );
};

export default Select;
