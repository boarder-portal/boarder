import React from 'react';
import styled from 'styled-components';

import Box from 'client/components/common/Box/Box';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';

interface ILobbyRoomProps {
  className?: string;
  title: string;
  options: React.ReactNode;
  players: number;
  maxPlayers: number;
  gameIsStarted: boolean;
  onClick(): void;
}

const Root = styled(Box)`
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  cursor: pointer;
`;

const LobbyRoom: React.FC<ILobbyRoomProps> = (props) => {
  const { className, title, options, players, maxPlayers, gameIsStarted, onClick } = props;

  return (
    <Root
      className={className}
      px={32}
      py={16}
      flex
      alignItems="center"
      onClick={onClick}
    >
      <Box flex column between={8}>
        <Box size="l">
          {title}

          <DotSeparator />

          {gameIsStarted ? 'идет игра' : 'ожидание игроков'}
        </Box>

        <Box>{options}</Box>
      </Box>

      <Box ml="auto" size="xxl">{`${players}/${maxPlayers}`}</Box>
    </Root>
  );
};

export default React.memo(LobbyRoom);
