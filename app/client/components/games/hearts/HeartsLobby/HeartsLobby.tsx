import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';

const HeartsLobby: FC = () => {
  return <Lobby<GameType.HEARTS> />;
};

export default memo(HeartsLobby);
