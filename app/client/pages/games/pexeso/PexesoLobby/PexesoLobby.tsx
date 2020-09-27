import React, { useCallback, useMemo, useState } from 'react';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types';
import { IPexesoGameOptions } from 'common/types/pexeso';

import PexesoGameOptions from 'client/pages/games/pexeso/PexesoLobby/components/PexesoGameOptions/PexesoGameOptions';
import Box from 'client/components/common/Box/Box';
import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const {
  games: {
    pexeso: {
      defaultGameOptions,
    },
  },
} = GAMES_CONFIG;

const PexesoLobby: React.FC = () => {
  const [options, setOptions] = useState<IPexesoGameOptions>(defaultGameOptions);

  const {
    lobby,
    createRoom,
    enterRoom,
  } = useLobby<EGame.PEXESO>(EGame.PEXESO, options);

  const optionsBlock = useMemo(() => {
    return (
      <PexesoGameOptions
        options={options}
        onOptionsChange={setOptions}
      />
    );
  }, [options]);

  const renderRoomOptions = useCallback((roomOptions: IPexesoGameOptions) => {
    return (
      <Box>
        {roomOptions.set}
      </Box>
    );
  }, []);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.PEXESO}
      rooms={lobby.rooms}
      options={optionsBlock}
      renderRoomOptions={renderRoomOptions}
      onEnterRoom={enterRoom}
      onCreateRoom={createRoom}
    />
  );
};

export default React.memo(PexesoLobby);
