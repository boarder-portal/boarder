import classNames from 'classnames';
import { FC, MouseEvent, ReactNode, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import { WithClassName } from 'client/types/react';

import styles from './Overlay.module.scss';

interface OverlayProps extends WithClassName {
  contentClassName?: string;
  open: boolean;
  children: ReactNode;
  onClose?(): void;
}

const Overlay: FC<OverlayProps> = (props) => {
  const { className, contentClassName, open, children, onClose } = props;

  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleOverlayClick = useCallback(
    (e: MouseEvent) => {
      const container = contentRef.current;

      if (!(e.target instanceof Element) || !container || !container.contains(e.target)) {
        onClose?.();
      }
    },
    [onClose],
  );

  const content = useMemo(
    () => (
      <div className={classNames(styles.root, { [styles.open]: open }, className)} onClick={handleOverlayClick}>
        <div ref={contentRef} className={classNames(styles.content, contentClassName)}>
          {children}
        </div>
      </div>
    ),
    [children, className, contentClassName, handleOverlayClick, open],
  );

  return createPortal(content, document.querySelector('#root')!);
};

export default Overlay;
