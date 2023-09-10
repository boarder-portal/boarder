import classNames from 'classnames';
import React, { FC, memo } from 'react';

import { Player as PlayerModel } from 'common/types/bombers';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Player.module.scss';

interface PlayerProps {
  player: PlayerModel;
}

const Player: FC<PlayerProps> = (props) => {
  const { player } = props;

  return (
    <Flex className={classNames(styles.root, { [styles.dead]: player.data.hp === 0 })} between={1}>
      <div className={styles.color} style={{ backgroundColor: player.data.color }} />
      <div className={styles.login}>{player.name}</div>
    </Flex>
  );
};

export default memo(Player);
