import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types';

import Lobby from 'server/gamesData/Lobby/Lobby';

interface IGameData<Game extends EGame> {
  lobby: Lobby<Game>;
}

const GAMES_DATA: { [Game in EGame]: IGameData<EGame> } = {} as { [Game in EGame]: IGameData<EGame> };

Object.keys(GAMES_CONFIG.games).forEach((game) => {
  GAMES_DATA[game as EGame] = {
    lobby: new Lobby({ game: game as EGame }),
  };
});
