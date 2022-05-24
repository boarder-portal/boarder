import React from 'react';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

const OnitamaLobby: React.FC = () => {
  return <Lobby game={EGame.ONITAMA} />;
};

export default React.memo(OnitamaLobby);
