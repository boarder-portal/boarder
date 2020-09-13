import React, { useEffect } from 'react';
import MuiModal from '@material-ui/core/Modal';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import block from 'bem-cn';

interface IModalProps {
  className?: string;
  children: React.ReactNode;
  onClose(): void;
}

const b = block('Modal');

const Modal: React.FC<IModalProps> = (props) => {
  const {
    className,
    children,
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
    <MuiModal
      className={b.mix(className).toString()}
      open
      onClose={onClose}
    >
      <div className={b('container')}>
        {children}
      </div>
    </MuiModal>
  );
};

export default styled(React.memo(Modal))`
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  .Modal {
    &__container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100vw;
      background: white;
      outline: none;
    }
  }
`;
