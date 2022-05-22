import React, { useRef } from 'react';
import Popover, { PopoverOrigin, PopoverProps } from '@material-ui/core/Popover';
import classNames from 'classnames';

import Flex from 'client/components/common/Flex/Flex';

import { useBoolean } from 'client/hooks/useBoolean';

import styles from './Dropdown.pcss';

interface IDropdownProps {
  className?: string;
  popup: React.ReactNode;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverProps['transformOrigin'];
}

const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: 'bottom',
  horizontal: 'center',
};

const DEFAULT_TRANSFORM_ORIGIN: PopoverProps['transformOrigin'] = {
  horizontal: 'center',
  vertical: 'top',
};

const Dropdown: React.FC<IDropdownProps> = (props) => {
  const {
    className,
    children,
    popup,
    anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
    transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
  } = props;

  const toggleElRef = useRef<HTMLDivElement | null>(null);

  const { value: opened, setFalse: close, toggle } = useBoolean(false);

  return (
    <div className={classNames(styles.root, className)}>
      <Flex ref={toggleElRef} onClick={toggle}>
        {children}
      </Flex>

      <Popover
        classes={{
          paper: styles.popup,
        }}
        open={opened}
        anchorEl={toggleElRef.current}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        elevation={3}
        onClose={close}
      >
        {popup}
      </Popover>
    </div>
  );
};

export default Dropdown;
