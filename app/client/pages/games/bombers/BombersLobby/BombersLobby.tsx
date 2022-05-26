import React from 'react';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

const BombersLobby: React.FC = () => {
  return <Lobby game={EGame.BOMBERS} />;
};

export default React.memo(BombersLobby);
