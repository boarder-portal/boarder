import React from 'react';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const {
  games: {
    [EGame.SEVEN_WONDERS]: {
      defaultGameOptions,
    },
  },
} = GAMES_CONFIG;

const SevenWondersLobby: React.FC = () => {
  const {
    lobby,
    createRoom,
    enterRoom,
  } = useLobby<EGame.SEVEN_WONDERS>(EGame.SEVEN_WONDERS, defaultGameOptions);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.SEVEN_WONDERS}
      rooms={lobby.rooms}
      onEnterRoom={enterRoom}
      onCreateRoom={createRoom}
    />
  );
};

export default React.memo(SevenWondersLobby);
