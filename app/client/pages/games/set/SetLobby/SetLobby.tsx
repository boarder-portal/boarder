import React, { useCallback, useMemo, useState } from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/set';

import { IGameOptions } from 'common/types/set';
import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';
import SetGameOptions from 'client/pages/games/set/SetLobby/components/SetGameOptions';

import useLobby from 'client/hooks/useLobby';

const SetLobby: React.FC = () => {
  const [options, setOptions] = useState<IGameOptions>(DEFAULT_GAME_OPTIONS);

  const { lobby, createRoom, enterRoom } = useLobby(EGame.SET, options);

  const optionsBlock = useMemo(() => {
    return <SetGameOptions options={options} onOptionsChange={setOptions} />;
  }, [options]);

  const renderRoomOptions = useCallback(() => {
    return null;
  }, []);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.SET}
      rooms={lobby.rooms}
      options={optionsBlock}
      renderRoomOptions={renderRoomOptions}
      onEnterRoom={enterRoom}
      onCreateRoom={createRoom}
    />
  );
};

export default React.memo(SetLobby);
