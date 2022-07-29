import React, { useEffect, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { EGame } from 'common/types/game';
import { EWind, IPlayer } from 'common/types/mahjong';

import { IGameProps } from 'client/pages/Game/Game';
import useSocket from 'client/hooks/useSocket';

import styles from './MahjongGame.pcss';

const MahjongGame: React.FC<IGameProps<EGame.MAHJONG>> = (props) => {
  const { io, gameInfo } = props;

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [scoresByRound, setScoresByRound] = useState<number[][]>();
  const [roundWind, setRoundWind] = useState<EWind | null>(null);

  useSocket(io, {});

  useEffect(() => {
    console.log(gameInfo);

    batchedUpdates(() => {
      setPlayers(gameInfo.players);
      setScoresByRound(gameInfo.scoresByRound);
      setRoundWind(gameInfo.round?.wind ?? null);
    });
  }, [gameInfo]);

  return null;
};

export default React.memo(MahjongGame);
