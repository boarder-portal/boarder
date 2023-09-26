import classNames from 'classnames';
import { FC, ReactNode, useCallback, useEffect, useRef } from 'react';

import { WithClassName } from 'client/types/react';

import useBoolean from 'client/hooks/useBoolean';
import useGlobalListener from 'client/hooks/useGlobalListener';

import styles from './Dropdown.module.scss';

interface DropdownProps extends WithClassName {
  popupClassName?: string;
  open?: boolean;
  disabled?: boolean;
  popup: ReactNode;
  popupPosition?: 'bottomLeft' | 'bottomCenter' | 'bottomRight';
  children: ReactNode;
  onChangeVisibility?(visible: boolean): void;
}

const Dropdown: FC<DropdownProps> = (props) => {
  const {
    className,
    popupClassName,
    open = false,
    disabled,
    popup,
    popupPosition = 'bottomCenter',
    onChangeVisibility,
    children,
  } = props;

  const { value: visible, setFalse: close, setValue } = useBoolean(open);

  const rootRef = useRef<HTMLDivElement | null>(null);

  useGlobalListener('click', typeof document === 'undefined' ? null : document, (e) => {
    const root = rootRef.current;

    if (!(e.target instanceof Element) || !root || !root.contains(e.target)) {
      close();
    }
  });

  const handleTriggerClick = useCallback(() => {
    setValue((visible) => {
      const newVisible = !visible;

      onChangeVisibility?.(newVisible);

      return newVisible;
    });
  }, [onChangeVisibility, setValue]);

  useEffect(() => {
    setValue(open);
  }, [open, setValue]);

  return (
    <div ref={rootRef} className={classNames(styles.root, className)}>
      <div className={classNames(styles.trigger, { [styles.disabled]: disabled })} onClick={handleTriggerClick}>
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
