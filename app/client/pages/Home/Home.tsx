import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { EGame } from 'common/types/game';

import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';

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
      <Text size="xxl" weight="bold">
        Игры
      </Text>

      <div className={styles.games}>
        {Object.values(EGame).map((game) => (
          <Flex
            key={game}
            className={styles.game}
            alignItems="flexEnd"
            style={{
              backgroundImage: `url("/games/backgrounds/${game}.png")`,
            }}
            onClick={() => handleGameClick(game)}
          >
            <Text className={styles.caption} size="xl">
              {GAME_NAMES[game]}
            </Text>
          </Flex>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Home);
