import { FC, memo, useEffect } from 'react';

import { GameType } from 'common/types/game';

import useSocket from 'client/hooks/useSocket';

import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';

import styles from './OuterMindsGameContent.module.scss';

const OuterMindsGameContent: FC<GameContentProps<GameType.OUTER_MINDS>> = (props) => {
  const { io, gameInfo } = props;

  useSocket(io, {});

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  return <GameContent game={GameType.OUTER_MINDS}></GameContent>;
};

export default memo(OuterMindsGameContent);
