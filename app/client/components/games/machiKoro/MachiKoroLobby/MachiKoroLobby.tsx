import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';

const MachiKoroLobby: FC = () => {
  return <Lobby game={GameType.MACHI_KORO} />;
};

export default memo(MachiKoroLobby);
