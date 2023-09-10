import classNames from 'classnames';
import React from 'react';

import { WithClassName } from 'client/types/react';

import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './Game.module.scss';

interface GameProps extends WithClassName {
  title: string;
  options: React.ReactNode;
  players: number;
  maxPlayers: number;
  hasStarted: boolean;
  onClick?(): void;
}

const Game: React.FC<GameProps> = (props) => {
  const { className, title, options, players, maxPlayers, hasStarted, onClick } = props;

  return (
    <Flex className={classNames(styles.root, className)} alignItems="center" onClick={onClick}>
      <Flex direction="column" between={2}>
        <Text size="l">
          {title}

          <DotSeparator />

          {hasStarted ? 'идет игра' : 'ожидание игроков'}
        </Text>

        {options}
      </Flex>

      <Text className={styles.playersCount} size="xxl">{`${players}/${maxPlayers}`}</Text>
    </Flex>
  );
};

export default React.memo(Game);
