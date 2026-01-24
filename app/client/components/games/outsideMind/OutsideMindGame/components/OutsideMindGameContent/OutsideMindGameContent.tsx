import { FC, memo, useEffect } from 'react';

import { GameType } from 'common/types/game';

import useSocket from 'client/hooks/useSocket';

import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';

import styles from './OutsideMindGame.module.scss';

const OutsideMindGameContent: FC<GameContentProps<GameType.OUTSIDE_MIND>> = (props) => {
  const { io, gameInfo } = props;

  useSocket(io, {});

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  return <GameContent game={GameType.OUTSIDE_MIND}></GameContent>;
};

export default memo(OutsideMindGameContent);
