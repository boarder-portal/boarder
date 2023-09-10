import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { EGame } from 'common/types/game';

import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';

import styles from './GameEnd.module.scss';

interface IGameEndProps {
  children?: React.ReactNode;
}

const GameEnd: React.FC<IGameEndProps> = (props) => {
  const { children } = props;

  const { game } = useParams<{ game: EGame }>();

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
