import { GameType } from 'common/types/game';

import Lobby from 'server/gamesData/Lobby/Lobby';

Object.values(GameType).forEach((game) => {
  new Lobby({ game });
});
