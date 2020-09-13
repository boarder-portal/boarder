import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import block from 'bem-cn';

import { EGame } from 'common/types';

import Box from 'client/components/common/Box/Box';

const Root = styled(Box)`
  .Home {
    &__game {
      width: 200px;
      height: 150px;
      color: white;
      border-radius: 8px;
      cursor: pointer;
    }
  }
`;

const GAME_COLORS = ['yellowgreen'];

const b = block('Home');

const Home: React.FC = () => {
  const history = useHistory();

  const handleGameClick = useCallback((game: EGame) => {
    history.push(`/${game}/lobby`);
  }, [history]);

  return (
    <Root className={b()} flex between={8}>
      {Object.values(EGame).map((game, index) => (
        <Box
          key={game}
          className={b('game')}
          flex
          column
          alignItems="center"
          justifyContent="center"
          size="xl"
          background={GAME_COLORS[index]}
          onClick={() => handleGameClick(game)}
        >
          {game}
        </Box>
      ))}
    </Root>
  );
};

export default React.memo(Home);
