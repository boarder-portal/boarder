import { FC } from 'react';
import classNames from 'classnames';
import Check from '@material-ui/icons/Check';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Checkbox.pcss';

interface ICheckboxProps {
  className?: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange(newValue: boolean): void;
}

const Checkbox: FC<ICheckboxProps> = (props) => {
  const { checked, disabled, label, onChange } = props;

  return (
    <Flex
      className={classNames(styles.root, { [styles.disabled]: disabled })}
      alignItems="center"
      between={2}
      onClick={() => onChange(!checked)}
    >
      <Flex className={classNames(styles.box)} justifyContent="center" alignItems="center">
        {checked && <Check className={styles.checkIcon} />}
      </Flex>

      <div>{label}</div>
    </Flex>
  );
};

export default Checkbox;
