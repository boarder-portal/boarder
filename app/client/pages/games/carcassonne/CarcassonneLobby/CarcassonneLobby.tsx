import React from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/carcassonne';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const CarcassonneLobby: React.FC = () => {
  const { lobby, createRoom, enterRoom } = useLobby(EGame.CARCASSONNE, DEFAULT_GAME_OPTIONS);

  if (!lobby) {
    return null;
  }

  return <Lobby game={EGame.CARCASSONNE} rooms={lobby.rooms} onEnterRoom={enterRoom} onCreateRoom={createRoom} />;
};

export default React.memo(CarcassonneLobby);
