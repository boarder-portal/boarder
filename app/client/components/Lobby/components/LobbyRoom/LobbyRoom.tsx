import React from 'react';
import styled from 'styled-components';

import Box from 'client/components/common/Box/Box';

interface ILobbyRoomProps {
  className?: string;
  title: string;
  options: React.ReactNode;
  players: number;
  maxPlayers: number;
  onClick(): void;
}

const Root = styled(Box)`
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  cursor: pointer;
`;

const LobbyRoom: React.FC<ILobbyRoomProps> = (props) => {
  const { className, title, options, players, maxPlayers, onClick } = props;

  return (
    <Root
      className={className}
      px={32}
      py={16}
      flex
      column
      between={8}
      onClick={onClick}
    >
      <Box size="l">{title}</Box>

      <Box>{options}</Box>

      <Box>{`${players}/${maxPlayers}`}</Box>
    </Root>
  );
};

export default React.memo(LobbyRoom);
