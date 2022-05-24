import React from 'react';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

const SetLobby: React.FC = () => {
  return <Lobby game={EGame.SET} />;
};

export default React.memo(SetLobby);
