import React from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/onitama';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const OnitamaLobby: React.FC = () => {
  const { lobby, createGame, enterGame } = useLobby(EGame.ONITAMA, DEFAULT_GAME_OPTIONS);

  if (!lobby) {
    return null;
  }

  return <Lobby game={EGame.ONITAMA} games={lobby.games} onEnterGame={enterGame} onCreateGame={createGame} />;
};

export default React.memo(OnitamaLobby);
