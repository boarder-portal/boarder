import React, { useCallback } from 'react';

import { EGame } from 'common/types/game';

import Lobby, { TRenderOptions } from 'client/components/Lobby/Lobby';
import SurvivalOnlineGameOptions from 'client/pages/games/survivalOnline/SurvivalOnlineLobby/components/SurvivalOnlineGameOptions';

const SurvivalOnlineLobby: React.FC = () => {
  const renderOptions: TRenderOptions<EGame.SURVIVAL_ONLINE> = useCallback((options, setOptions) => {
    return <SurvivalOnlineGameOptions options={options} onOptionsChange={setOptions} />;
  }, []);

  return <Lobby game={EGame.SURVIVAL_ONLINE} renderOptions={renderOptions} />;
};

export default React.memo(SurvivalOnlineLobby);
