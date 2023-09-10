import classNames from 'classnames';
import { FC } from 'react';

import { WithClassName } from 'client/types/react';

import Flex from 'client/components/common/Flex/Flex';
import CheckIcon from 'client/components/icons/CheckIcon/CheckIcon';

import styles from './Checkbox.module.scss';

interface CheckboxProps extends WithClassName {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange(newValue: boolean): void;
}

const Checkbox: FC<CheckboxProps> = (props) => {
  const { className, checked, disabled, label, onChange } = props;

  return (
    <Flex
      className={classNames(styles.root, { [styles.disabled]: disabled }, className)}
      alignItems="center"
      between={2}
      onClick={() => onChange(!checked)}
    >
      <Flex className={classNames(styles.box)} justifyContent="center" alignItems="center">
        {checked && <CheckIcon className={styles.checkIcon} />}
      </Flex>

      <div>{label}</div>
    </Flex>
  );
};

export default Checkbox;
