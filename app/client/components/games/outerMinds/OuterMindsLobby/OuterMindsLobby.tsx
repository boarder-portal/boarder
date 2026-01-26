import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';

const OuterMindsLobby: FC = () => {
  return <Lobby game={GameType.OUTER_MINDS} />;
};

export default memo(OuterMindsLobby);
