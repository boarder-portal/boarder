import classNames from 'classnames';
import { FC, ReactNode, memo } from 'react';

import { WithClassName } from 'client/types/react';

import Flex from 'client/components/common/Flex/Flex';
import Overlay from 'client/components/common/Overlay/Overlay';
import Text from 'client/components/common/Text/Text';
import CrossIcon from 'client/components/icons/CrossIcon/CrossIcon';

import styles from './Modal.module.scss';

interface ModalProps extends WithClassName {
  contentClassName?: string;
  open: boolean;
  title?: ReactNode;
  children: ReactNode;
  onClose?(): void;
}

const Modal: FC<ModalProps> = (props) => {
  const { className, contentClassName, open, title, children, onClose } = props;

  return (
    <Overlay
      className={styles.overlay}
      contentClassName={classNames(styles.modal, className)}
      open={open}
      onClose={onClose}
    >
      <Flex className={styles.header} between={4} alignItems="center" justifyContent="spaceBetween">
        {typeof title === 'string' ? (
          <Text size="xxl" weight="bold" withEllipsis>
            {title}
          </Text>
        ) : (
          <span>{title}</span>
        )}

        <CrossIcon className={styles.crossIcon} onClick={onClose} />
      </Flex>

      <div className={classNames(styles.content, contentClassName)}>{children}</div>
    </Overlay>
  );
};

export default memo(Modal);
