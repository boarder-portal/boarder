import { FC, memo, useEffect } from 'react';

import { GameType } from 'common/types/game';

import useSocket from 'client/hooks/useSocket';

import { GameProps } from 'client/pages/Game/Game';

import styles from './RedSevenGame.module.scss';

const RedSevenGame: FC<GameProps<GameType.RED_SEVEN>> = (props) => {
  const { io, gameInfo } = props;

  useSocket(io, {});

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  return null;
};

export default memo(RedSevenGame);
