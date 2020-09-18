import React from 'react';
import styled from 'styled-components';

import { IRoom } from 'common/types/room';

import Box from 'client/components/common/Box/Box';

interface IRoomProps {
  room: IRoom;
  onEnter(roomId: string): void;
}

const Root = styled(Box)`
  cursor: pointer;
`;

const Room: React.FC<IRoomProps> = (props) => {
  const {
    room: {
      id,
      players,
      options,
    },
    onEnter,
  } = props;

  return (
    <Root
      flex
      onClick={() => onEnter(id)}
    >
      <div>{id}</div>

      <Box ml={20}>
        {options.set}
      </Box>

      <Box ml={20}>
        {players.map(({ login }) => login).join(', ')}
      </Box>
    </Root>
  );
};

export default React.memo(Room);
