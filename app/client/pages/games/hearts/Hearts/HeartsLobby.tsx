import React from 'react';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

const HeartsLobby: React.FC = () => {
  return <Lobby game={EGame.HEARTS} />;
};

export default React.memo(HeartsLobby);
