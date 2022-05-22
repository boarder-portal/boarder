import React from 'react';
import classNames from 'classnames';

import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

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
    <Flex className={classNames(styles.root, className)} alignItems="center" onClick={onClick}>
      <Flex direction="column" between={2}>
        <Text size="l">
          {title}

          <DotSeparator />

          {gameIsStarted ? 'идет игра' : 'ожидание игроков'}
        </Text>

        {options}
      </Flex>

      <Text className={styles.playersCount} size="xxl">{`${players}/${maxPlayers}`}</Text>
    </Flex>
  );
};

export default React.memo(Room);
