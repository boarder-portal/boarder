import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';

const SetLobby: FC = () => {
  return <Lobby<GameType.SET> />;
};

export default memo(SetLobby);
