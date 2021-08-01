import React from 'react';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const {
  games: {
    [EGame.CARCASSONNE]: {
      defaultGameOptions,
    },
  },
} = GAMES_CONFIG;

const CarcassonneLobby: React.FC = () => {
  const {
    lobby,
    createRoom,
    enterRoom,
  } = useLobby<EGame.CARCASSONNE>(EGame.CARCASSONNE, defaultGameOptions);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.CARCASSONNE}
      rooms={lobby.rooms}
      onEnterRoom={enterRoom}
      onCreateRoom={createRoom}
    />
  );
};

export default React.memo(CarcassonneLobby);
