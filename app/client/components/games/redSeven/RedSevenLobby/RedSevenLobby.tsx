import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';

const RedSevenLobby: FC = () => {
  return <Lobby<GameType.RED_SEVEN> />;
};

export default memo(RedSevenLobby);
