import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types';

import io from 'server/io';
import Lobby from 'server/gamesData/Lobby/Lobby';

interface IGameData {
  lobby: Lobby;
}

const GAMES_DATA: Record<EGame, IGameData> = {} as Record<EGame, IGameData>;

Object.values(GAMES_CONFIG.games).forEach((game) => {
  const gameLobbyNamespace = io.of(`/${game.name}/lobby`);

  GAMES_DATA[game.name] = {
    lobby: new Lobby({
      io: gameLobbyNamespace,
    }),
  };
});
