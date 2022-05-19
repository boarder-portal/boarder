import React from 'react';
import MuiModal from '@material-ui/core/Modal';
import styled from 'styled-components';
import block from 'bem-cn';

interface IModalProps {
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  open: boolean;
  onClose(): void;
}

const b = block('Modal');

const Root = styled(MuiModal)`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  .Modal {
    &__container {
      display: flex;
      flex-direction: column;
      background: white;
      outline: none;
      border-radius: 8px;
      padding: 16px 32px;
    }
  }
`;

const Modal: React.FC<IModalProps> = (props) => {
  const { className, containerClassName, children, open, onClose } = props;

  return (
    <Root className={b.mix(className)} open={open} onClose={onClose}>
      <div className={b('container').mix(containerClassName)}>{children}</div>
    </Root>
  );
};

export default React.memo(Modal);
