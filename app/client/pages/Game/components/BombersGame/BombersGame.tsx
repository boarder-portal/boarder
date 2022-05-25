import React from 'react';

import { EGame } from 'common/types/game';

import { IGameProps } from 'client/pages/Game/Game';
import useSocket from 'client/hooks/useSocket';

const BombersGame: React.FC<IGameProps<EGame.BOMBERS>> = (props) => {
  const { io, gameInfo } = props;

  useSocket(io, {});

  return null;
};

export default React.memo(BombersGame);
