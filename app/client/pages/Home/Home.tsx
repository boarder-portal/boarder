import { FC, memo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { GAME_NAMES } from 'common/constants/game';

import { GameType } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './Home.module.scss';

const GAMES_IN_DEVELOPMENT: GameType[] = [];

const Home: FC = () => {
  const history = useHistory();

  const handleGameClick = useCallback(
    (game: GameType) => {
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
        {Object.values(GameType)
          .filter((game) => process.env.NODE_ENV !== 'production' || !GAMES_IN_DEVELOPMENT.includes(game))
          .map((game) => (
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

export default memo(Home);
