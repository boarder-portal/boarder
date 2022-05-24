import React from 'react';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

const CarcassonneLobby: React.FC = () => {
  return <Lobby game={EGame.CARCASSONNE} />;
};

export default React.memo(CarcassonneLobby);
