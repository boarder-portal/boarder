import React, { useEffect } from 'react';

import { EGame } from 'common/types/game';

import { IGameProps } from 'client/pages/Game/Game';
import useSocket from 'client/hooks/useSocket';

import styles from './MahjongGame.pcss';

const MahjongGame: React.FC<IGameProps<EGame.MAHJONG>> = (props) => {
  const { io, gameInfo } = props;

  useSocket(io, {});

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  return null;
};

export default React.memo(MahjongGame);
