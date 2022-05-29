import React from 'react';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

const MachiKoroLobby: React.FC = () => {
  return <Lobby game={EGame.MACHI_KORO} />;
};

export default React.memo(MachiKoroLobby);
