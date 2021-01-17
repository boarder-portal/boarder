import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';

import Lobby from 'server/gamesData/Lobby/Lobby';

interface IGameData<Game extends EGame> {
  lobby: Lobby<Game>;
}

const GAMES_DATA = {} as { [Game in EGame]: IGameData<EGame> };

(Object.keys(GAMES_CONFIG.games) as EGame[]).forEach((game) => {
  GAMES_DATA[game] = {
    lobby: new Lobby({ game }),
  };
});
