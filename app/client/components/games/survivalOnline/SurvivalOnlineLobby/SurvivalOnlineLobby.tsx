import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';

const SurvivalOnlineLobby: FC = () => {
  return <Lobby game={GameType.SURVIVAL_ONLINE} />;
};

export default memo(SurvivalOnlineLobby);
