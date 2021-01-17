import React from 'react';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const {
  games: {
    [EGame.ONITAMA]: {
      defaultGameOptions,
    },
  },
} = GAMES_CONFIG;

const OnitamaLobby: React.FC = () => {
  const {
    lobby,
    createRoom,
    enterRoom,
  } = useLobby<EGame.ONITAMA>(EGame.ONITAMA, defaultGameOptions);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.ONITAMA}
      rooms={lobby.rooms}
      onEnterRoom={enterRoom}
      onCreateRoom={createRoom}
    />
  );
};

export default React.memo(OnitamaLobby);
