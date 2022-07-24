import { FC, ReactNode, useCallback, MouseEvent } from 'react';
import classNames from 'classnames';

import { useBoolean } from 'client/hooks/useBoolean';
import useGlobalListener from 'client/hooks/useGlobalListener';

import styles from './Dropdown.pcss';

interface IDropdownProps {
  className?: string;
  popupClassName?: string;
  popup: ReactNode;
  popupPosition?: 'bottomLeft' | 'bottomCenter' | 'bottomRight';
}

const Dropdown: FC<IDropdownProps> = (props) => {
  const { className, popupClassName, popup, popupPosition = 'bottomCenter', children } = props;

  const { value: visible, setFalse: close, setValue } = useBoolean(false);

  useGlobalListener('click', typeof document === 'undefined' ? null : document, close);

  const handleTriggerClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      setValue((v) => !v);
    },
    [setValue],
  );

  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.trigger} onClick={handleTriggerClick}>
        {children}
      </div>

      {visible && (
        <div className={classNames(styles.popup, styles[popupPosition], { [styles.visible]: visible }, popupClassName)}>
          {popup}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
