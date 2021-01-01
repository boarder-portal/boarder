import React, { useCallback, useMemo, useState } from 'react';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types';
import { ISetGameOptions } from 'common/types/set';

import Lobby from 'client/components/Lobby/Lobby';
import SetGameOptions from 'client/pages/games/set/SetLobby/components/SetGameOptions';

import useLobby from 'client/hooks/useLobby';

const {
  games: {
    [EGame.SET]: {
      defaultGameOptions,
    },
  },
} = GAMES_CONFIG;

const SetLobby: React.FC = () => {
  const [options, setOptions] = useState<ISetGameOptions>(defaultGameOptions);

  const {
    lobby,
    createRoom,
    enterRoom,
  } = useLobby<EGame.SET>(EGame.SET, options);

  const optionsBlock = useMemo(() => {
    return (
      <SetGameOptions
        options={options}
        onOptionsChange={setOptions}
      />
    );
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
