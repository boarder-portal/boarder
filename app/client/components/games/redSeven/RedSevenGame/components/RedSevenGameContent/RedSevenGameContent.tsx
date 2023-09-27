import { FC, memo, useEffect } from 'react';

import { GameType } from 'common/types/game';

import useSocket from 'client/hooks/useSocket';

import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';

import styles from './RedSevenGameContent.module.scss';

const RedSevenGameContent: FC<GameContentProps<GameType.RED_SEVEN>> = (props) => {
  const { io, gameInfo } = props;

  useSocket(io, {});

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  return <GameContent></GameContent>;
};

export default memo(RedSevenGameContent);
