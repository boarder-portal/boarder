import React from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/carcassonne';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const CarcassonneLobby: React.FC = () => {
  const { lobby, createGame, enterGame } = useLobby(EGame.CARCASSONNE, DEFAULT_GAME_OPTIONS);

  if (!lobby) {
    return null;
  }

  return <Lobby game={EGame.CARCASSONNE} games={lobby.games} onEnterGame={enterGame} onCreateGame={createGame} />;
};

export default React.memo(CarcassonneLobby);
