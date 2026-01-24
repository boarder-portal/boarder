import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';

const OutsideMindLobby: FC = () => {
  return <Lobby game={GameType.OUTSIDE_MIND} />;
};

export default memo(OutsideMindLobby);
