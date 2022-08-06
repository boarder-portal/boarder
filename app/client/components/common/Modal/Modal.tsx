import { FC, useCallback, useMemo, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames/bind';

import useGlobalListener from 'client/hooks/useGlobalListener';

import styles from './Modal.pcss';

interface IModalProps {
  containerClassName?: string;
  open: boolean;
  onClose?(): void;
}

const Modal: FC<IModalProps> = (props) => {
  const { containerClassName, open, children, onClose } = props;

  const handleContainerClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  useGlobalListener('keyup', document, (e) => {
    if (open && e.code === 'Escape') {
      e.preventDefault();

      onClose?.();
    }
  });

  const content = useMemo(
    () => (
      <div className={classNames(styles.overlay, { [styles.open]: open })} onClick={onClose}>
        <div className={classNames(styles.container, containerClassName)} onClick={handleContainerClick}>
          {children}
        </div>
      </div>
    ),
    [children, containerClassName, handleContainerClick, onClose, open],
  );

  return createPortal(content, document.querySelector('#root')!);
};

export default Modal;
