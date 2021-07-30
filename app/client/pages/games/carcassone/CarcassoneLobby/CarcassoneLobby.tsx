import React from 'react';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const {
  games: {
    [EGame.CARCASSONE]: {
      defaultGameOptions,
    },
  },
} = GAMES_CONFIG;

const CarcassoneLobby: React.FC = () => {
  const {
    lobby,
    createRoom,
    enterRoom,
  } = useLobby<EGame.CARCASSONE>(EGame.CARCASSONE, defaultGameOptions);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.CARCASSONE}
      rooms={lobby.rooms}
      onEnterRoom={enterRoom}
      onCreateRoom={createRoom}
    />
  );
};

export default React.memo(CarcassoneLobby);
