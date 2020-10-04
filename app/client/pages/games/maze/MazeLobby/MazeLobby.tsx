import React from 'react';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const {
  games: {
    [EGame.MAZE]: {
      defaultGameOptions,
    },
  },
} = GAMES_CONFIG;

const MazeLobby: React.FC = () => {
  const {
    lobby,
    createRoom,
    enterRoom,
  } = useLobby<EGame.MAZE>(EGame.MAZE, defaultGameOptions);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.SURVIVAL_ONLINE}
      rooms={lobby.rooms}
      onEnterRoom={enterRoom}
      onCreateRoom={createRoom}
    />
  );
};

export default React.memo(MazeLobby);
