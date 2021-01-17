import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import block from 'bem-cn';

import { EGame } from 'common/types/game';

import Box from 'client/components/common/Box/Box';

const Root = styled.div`
  padding-top: 20px;

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

const GAME_COLORS = ['#9acd32', '#ff0000', '#2929ca', '#c500f1', '#bbcc33'];

const b = block('Home');

const Home: React.FC = () => {
  const history = useHistory();

  const handleGameClick = useCallback((game: EGame) => {
    history.push(`/${game}/lobby`);
  }, [history]);

  return (
    <Root className={b()} >
      <Box size="xxl" bold>Игры</Box>

      <Box flex between={8} mt={20}>
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
      </Box>
    </Root>
  );
};

export default React.memo(Home);
