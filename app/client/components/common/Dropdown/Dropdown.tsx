import React, { useRef } from 'react';
import Popover, { PopoverOrigin, PopoverProps } from '@material-ui/core/Popover';
import styled, { createGlobalStyle } from 'styled-components';
import block from 'bem-cn';

import Box, { IBoxProps } from 'client/components/common/Box/Box';
import Flex from 'client/components/common/Flex/Flex';

import { useBoolean } from 'client/hooks/useBoolean';

interface IDropdownProps extends IBoxProps {
  popup: React.ReactNode;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverProps['transformOrigin'];
}

const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: 'bottom',
  horizontal: 'center',
};

const DEFAULT_TRANSFORM_ORIGIN: PopoverProps['transformOrigin'] = {
  horizontal: 'center',
  vertical: 'top',
};

const b = block('Dropdown');

const Root = styled(Box)`
  cursor: pointer;
`;

const GlobalStyle = createGlobalStyle`
  .Dropdown__popup {
    margin-top: 4px;
  }
`;

const Dropdown: React.FC<IDropdownProps> = (props) => {
  const {
    children,
    popup,
    anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
    transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
    ...boxProps
  } = props;

  const toggleElRef = useRef<HTMLDivElement | null>(null);

  const { value: opened, setFalse: close, toggle } = useBoolean(false);

  return (
    <Root {...boxProps}>
      <GlobalStyle />

      <Flex ref={toggleElRef} onClick={toggle}>
        {children}
      </Flex>

      <Popover
        classes={{
          paper: b('popup').toString(),
        }}
        open={opened}
        anchorEl={toggleElRef.current}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        elevation={3}
        onClose={close}
      >
        {popup}
      </Popover>
    </Root>
  );
};

export default React.memo(Dropdown);
