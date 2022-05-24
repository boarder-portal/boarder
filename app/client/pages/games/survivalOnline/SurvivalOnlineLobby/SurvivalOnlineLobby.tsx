import React from 'react';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

const SurvivalOnlineLobby: React.FC = () => {
  return <Lobby game={EGame.SURVIVAL_ONLINE} />;
};

export default React.memo(SurvivalOnlineLobby);
