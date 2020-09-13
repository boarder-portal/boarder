import React from 'react';
import { Container, Drawer } from '@material-ui/core';
import styled from 'styled-components';
import block from 'bem-cn';

interface IBottomSheetProps {
  className?: string;
  opened: boolean;
  children: React.ReactElement | React.ReactFragment;
  onClose(): void;
}

const b = block('BottomSheet');

const BottomSheet: React.FC<IBottomSheetProps> = (props) => {
  const {
    className,
    opened,
    children,
    onClose,
  } = props;

  return (
    <Drawer
      className={b.mix(className).toString()}
      classes={{ paper: b('paper').toString() }}
      anchor="bottom"
      open={opened}
      onClose={onClose}
    >
      <Container className={b('container').toString()}>
        {children}
      </Container>
    </Drawer>
  );
};

export default styled(React.memo(BottomSheet))`
  .BottomSheet {
    &__paper {
      max-height: 80%;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    &__container {
      padding-top: 20px;
      padding-bottom: 20px;
    }
  }
`;
