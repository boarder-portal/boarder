import React from 'react';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

const SevenWondersLobby: React.FC = () => {
  return <Lobby game={EGame.SEVEN_WONDERS} />;
};

export default React.memo(SevenWondersLobby);
