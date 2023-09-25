import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';

const OnitamaLobby: FC = () => {
  return <Lobby game={GameType.ONITAMA} />;
};

export default memo(OnitamaLobby);
