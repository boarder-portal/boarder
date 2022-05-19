import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { EGame } from 'common/types/game';

import Box from 'client/components/common/Box/Box';

import styles from './Home.pcss';

const GAME_NAMES: Record<EGame, string> = {
  [EGame.PEXESO]: 'Pexeso',
  [EGame.SURVIVAL_ONLINE]: 'Выживать онлайн',
  [EGame.SET]: 'Сет',
  [EGame.ONITAMA]: 'Онитама',
  [EGame.CARCASSONNE]: 'Каркассон',
  [EGame.SEVEN_WONDERS]: 'Семь чудес',
  [EGame.HEARTS]: 'Червы',
};

const Home: React.FC = () => {
  const history = useHistory();

  const handleGameClick = useCallback(
    (game: EGame) => {
      history.push(`/${game}/lobby`);
    },
    [history],
  );

  return (
    <div className={styles.root}>
      <Box size="xxl" bold>
        Игры
      </Box>

      <Box className={styles.games} mt={20}>
        {Object.values(EGame).map((game) => (
          <Box
            key={game}
            className={styles.game}
            flex
            alignItems="flex-end"
            justifyContent="flex-start"
            size="xl"
            style={{
              backgroundImage: `url("/games/backgrounds/${game}.png")`,
            }}
            onClick={() => handleGameClick(game)}
          >
            <span className={styles.caption}>{GAME_NAMES[game]}</span>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default React.memo(Home);
