import { FC, useCallback, useMemo, MouseEvent, useRef } from 'react';
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

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleOverlayClick = useCallback(
    (e: MouseEvent) => {
      const container = containerRef.current;

      if (!(e.target instanceof Element) || !container || !container.contains(e.target)) {
        onClose?.();
      }
    },
    [onClose],
  );

  useGlobalListener('keyup', document, (e) => {
    if (open && e.code === 'Escape') {
      e.preventDefault();

      onClose?.();
    }
  });

  const content = useMemo(
    () => (
      <div className={classNames(styles.overlay, { [styles.open]: open })} onClick={handleOverlayClick}>
        <div ref={containerRef} className={classNames(styles.container, containerClassName)}>
          {children}
        </div>
      </div>
    ),
    [children, containerClassName, handleOverlayClick, open],
  );

  return createPortal(content, document.querySelector('#root')!);
};

export default Modal;
