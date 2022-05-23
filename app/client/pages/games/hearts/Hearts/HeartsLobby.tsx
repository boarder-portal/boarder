import React from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/hearts';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const HeartsLobby: React.FC = () => {
  const { lobby, createGame, enterGame } = useLobby(EGame.HEARTS, DEFAULT_GAME_OPTIONS);

  if (!lobby) {
    return null;
  }

  return <Lobby game={EGame.HEARTS} games={lobby.games} onEnterGame={enterGame} onCreateGame={createGame} />;
};

export default React.memo(HeartsLobby);
