import React from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/sevenWonders';

import { EGame } from 'common/types/game';

import Lobby from 'client/components/Lobby/Lobby';

import useLobby from 'client/hooks/useLobby';

const SevenWondersLobby: React.FC = () => {
  const { lobby, createGame, enterGame } = useLobby(EGame.SEVEN_WONDERS, DEFAULT_GAME_OPTIONS);

  if (!lobby) {
    return null;
  }

  return <Lobby game={EGame.SEVEN_WONDERS} games={lobby.games} onEnterGame={enterGame} onCreateGame={createGame} />;
};

export default React.memo(SevenWondersLobby);
