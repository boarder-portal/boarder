import { FC, memo, useEffect } from 'react';

import { GameType } from 'common/types/game';

import useSocket from 'client/hooks/useSocket';

import { GameContentProps } from 'client/components/game/Game/Game';

import styles from './GameContent.module.scss';

const GameContent: FC<GameContentProps<GameType.RED_SEVEN>> = (props) => {
  const { io, gameInfo } = props;

  useSocket(io, {});

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  return null;
};

export default memo(GameContent);
