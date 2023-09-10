import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { GameType } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './GameEnd.module.scss';

interface GameEndProps {
  children?: React.ReactNode;
}

const GameEnd: React.FC<GameEndProps> = (props) => {
  const { children } = props;

  const { game } = useParams<{ game: GameType }>();

  return (
    <Flex className={styles.root} justifyContent="center" alignItems="center" direction="column" between={5}>
      <Text size="xxl" weight="bold">
        Игра окончена
      </Text>

      {children}

      <Link to={`/${game}/lobby`}>Лобби</Link>
    </Flex>
  );
};

export default React.memo(GameEnd);
