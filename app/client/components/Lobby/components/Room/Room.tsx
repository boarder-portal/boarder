import React from 'react';
import classNames from 'classnames';

import Box from 'client/components/common/Box/Box';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';

import styles from './Room.pcss';

interface ILobbyRoomProps {
  className?: string;
  title: string;
  options: React.ReactNode;
  players: number;
  maxPlayers: number;
  gameIsStarted: boolean;
  onClick(): void;
}

const Room: React.FC<ILobbyRoomProps> = (props) => {
  const { className, title, options, players, maxPlayers, gameIsStarted, onClick } = props;

  return (
    <Box className={classNames(styles.root, className)} px={32} py={16} flex alignItems="center" onClick={onClick}>
      <Box flex column between={8}>
        <Box size="l">
          {title}

          <DotSeparator />

          {gameIsStarted ? 'идет игра' : 'ожидание игроков'}
        </Box>

        <Box>{options}</Box>
      </Box>

      <Box ml="auto" size="xxl">{`${players}/${maxPlayers}`}</Box>
    </Box>
  );
};

export default React.memo(Room);
