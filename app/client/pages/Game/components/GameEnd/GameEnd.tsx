import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { EGame } from 'common/types/game';

import Box from 'client/components/common/Box/Box';

interface IGameEndProps {
  children?: React.ReactNode;
}

const GameEnd: React.FC<IGameEndProps> = (props) => {
  const { children } = props;

  const { game } = useParams<{ game: EGame }>();

  return (
    <Box flex grow justifyContent="center" alignItems="center" column between={20}>
      <Box size="xxl" bold>Игра окончена</Box>

      {children}

      <Link to={`/${game}/lobby`}>Лобби</Link>
    </Box>
  );
};

export default React.memo(GameEnd);
