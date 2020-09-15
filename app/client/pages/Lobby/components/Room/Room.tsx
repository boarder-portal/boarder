import React from 'react';

import { IRoom } from 'common/types/room';

import Box from 'client/components/common/Box/Box';

interface IRoomProps {
  room: IRoom;
  onEnter(roomId: string): void;
}

const Room: React.FC<IRoomProps> = (props) => {
  const {
    room: {
      id,
      players,
    },
    onEnter,
  } = props;

  return (
    <Box
      flex
      onClick={() => onEnter(id)}
    >
      <div>{id}</div>

      <Box ml={20}>
        {players.map(({ login }) => login).join(', ')}
      </Box>
    </Box>
  );
};

export default React.memo(Room);
