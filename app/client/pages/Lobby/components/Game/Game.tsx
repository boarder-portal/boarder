import classNames from 'classnames';
import { FC, ReactNode, memo } from 'react';

import { WithClassName } from 'client/types/react';
import { GameStatus } from 'common/types/game';

import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './Game.module.scss';

interface GameProps extends WithClassName {
  title: string;
  options: ReactNode;
  players: number;
  maxPlayers: number;
  status: GameStatus;
  onClick?(): void;
}

const STATUS_CAPTION: Record<GameStatus, string> = {
  [GameStatus.WAITING]: 'ожидание игроков',
  [GameStatus.GAME_IN_PROGRESS]: 'идет игра',
  [GameStatus.GAME_ENDED]: 'игра окончена',
};

const Game: FC<GameProps> = (props) => {
  const { className, title, options, players, maxPlayers, status, onClick } = props;

  return (
    <Flex className={classNames(styles.root, className)} alignItems="center" onClick={onClick}>
      <Flex direction="column" between={2}>
        <Text size="l">
          {title}

          <DotSeparator />

          {STATUS_CAPTION[status]}
        </Text>

        {options}
      </Flex>

      <Text className={styles.playersCount} size="xxl">{`${players}/${maxPlayers}`}</Text>
    </Flex>
  );
};

export default memo(Game);
