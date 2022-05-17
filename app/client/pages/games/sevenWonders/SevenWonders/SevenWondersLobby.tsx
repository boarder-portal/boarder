import React from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/sevenWonders';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const SevenWondersLobby: React.FC = () => {
  const { lobby, createRoom, enterRoom } = useLobby(EGame.SEVEN_WONDERS, DEFAULT_GAME_OPTIONS);

  if (!lobby) {
    return null;
  }

  return <Lobby game={EGame.SEVEN_WONDERS} rooms={lobby.rooms} onEnterRoom={enterRoom} onCreateRoom={createRoom} />;
};

export default React.memo(SevenWondersLobby);
