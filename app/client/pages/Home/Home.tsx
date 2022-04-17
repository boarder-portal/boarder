import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import block from 'bem-cn';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';

import Box from 'client/components/common/Box/Box';

const Root = styled.div`
  padding-top: 20px;

  --columns-count: 4;

  .Home {
    &__games {
      display: grid;
      grid-template-columns: repeat(var(--columns-count), 1fr);
      grid-gap: 8px;
    }

    &__game {
      aspect-ratio: 4 / 3;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid #000;
      background-position: 50% 50%;
      background-size: cover;

      &__caption {
        padding: 3px 8px;
        color: #fff;
        text-shadow:
          -1px -1px 0 #000,
          1px -1px 0 #000,
          -1px 1px 0 #000,
          1px 1px 0 #000,
          0 0 8px #000;
      }
    }
  }

  @media (max-width: 1080px) {
    --columns-count: 3;
  }

  @media (max-width: 720px) {
    --columns-count: 2;
  }

  @media (max-width: 400px) {
    --columns-count: 1;
  }
`;

const { games } = GAMES_CONFIG;

const b = block('Home');

const Home: React.FC = () => {
  const history = useHistory();

  const handleGameClick = useCallback((game: EGame) => {
    history.push(`/${game}/lobby`);
  }, [history]);

  return (
    <Root className={b()} >
      <Box size="xxl" bold>Игры</Box>

      <Box className={b('games')} mt={20}>
        {Object.values(EGame).map((game) => (
          <Box
            key={game}
            className={b('game')}
            flex
            alignItems="flex-end"
            justifyContent="flex-start"
            size="xl"
            style={{
              backgroundImage: `url("/games/backgrounds/${game}.png")`,
            }}
            onClick={() => handleGameClick(game)}
          >
            <span className={b('game__caption')}>
              {games[game].name}
            </span>
          </Box>
        ))}
      </Box>
    </Root>
  );
};

export default React.memo(Home);
