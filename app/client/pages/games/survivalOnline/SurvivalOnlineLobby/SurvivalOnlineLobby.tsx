import React, { useCallback, useMemo, useState } from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/survivalOnline';

import { IGameOptions } from 'common/types/survivalOnline';
import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';
import SurvivalOnlineGameOptions from 'client/pages/games/survivalOnline/SurvivalOnlineLobby/components/SurvivalOnlineGameOptions';

import useLobby from 'client/hooks/useLobby';

const SurvivalOnlineLobby: React.FC = () => {
  const [options, setOptions] = useState<IGameOptions>(DEFAULT_GAME_OPTIONS);

  const { lobby, createGame, enterGame } = useLobby(EGame.SURVIVAL_ONLINE, options);

  const optionsBlock = useMemo(() => {
    return <SurvivalOnlineGameOptions options={options} onOptionsChange={setOptions} />;
  }, [options]);

  const renderGameOptions = useCallback(() => {
    return null;
  }, []);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.SURVIVAL_ONLINE}
      games={lobby.games}
      options={optionsBlock}
      renderGameOptions={renderGameOptions}
      onEnterGame={enterGame}
      onCreateGame={createGame}
    />
  );
};

export default React.memo(SurvivalOnlineLobby);
