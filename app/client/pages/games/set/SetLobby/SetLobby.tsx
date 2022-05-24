import React, { useCallback } from 'react';

import { EGame } from 'common/types/game';

import Lobby, { TRenderOptions } from 'client/components/Lobby/Lobby';
import SetGameOptions from 'client/pages/games/set/SetLobby/components/SetGameOptions';

const SetLobby: React.FC = () => {
  const renderOptions: TRenderOptions<EGame.SET> = useCallback((options, setOptions) => {
    return <SetGameOptions options={options} onOptionsChange={setOptions} />;
  }, []);

  return <Lobby game={EGame.SET} renderOptions={renderOptions} />;
};

export default React.memo(SetLobby);
