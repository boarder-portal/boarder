import React, { useEffect } from 'react';
import MuiModal from '@material-ui/core/Modal';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import block from 'bem-cn';

interface IModalProps {
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
  const {
    children,
    open,
    onClose,
  } = props;

  const history = useHistory();

  useEffect(() => {
    history.push(history.location);

    let isBackButtonClicked = false;

    const removeListener = history.listen(() => {
      isBackButtonClicked = true;

      onClose();
    });

    return () => {
      removeListener();

      if (!isBackButtonClicked) {
        history.goBack();
      }
    };
  }, [history, onClose]);

  return (
    <Root
      className={b.toString()}
      open={open}
      onClose={onClose}
    >
      <div className={b('container')}>
        {children}
      </div>
    </Root>
  );
};

export default React.memo(Modal);
