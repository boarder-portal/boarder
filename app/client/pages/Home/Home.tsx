import { FC, memo } from 'react';
import { Link } from 'react-router-dom';

import { GAMES_IN_DEVELOPMENT, GAME_NAMES } from 'common/constants/game';

import { GameType } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './Home.module.scss';

const Home: FC = () => {
  return (
    <Flex className={styles.root} direction="column" between={5}>
      <Text size="xxl" weight="bold">
        Игры
      </Text>

      <div className={styles.games}>
        {Object.values(GameType)
          .filter((game) => process.env.NODE_ENV !== 'production' || !GAMES_IN_DEVELOPMENT.includes(game))
          .map((game) => (
            <Link
              key={game}
              className={styles.game}
              to={`/${game}/lobby`}
              style={{
                backgroundImage: `url("/public/game/images/backgrounds/${game}.png")`,
              }}
            >
              <Text className={styles.caption} size="xl">
                {GAME_NAMES[game]}
              </Text>
            </Link>
          ))}
      </div>
    </Flex>
  );
};

export default memo(Home);
