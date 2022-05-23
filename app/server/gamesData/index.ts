import { EGame } from 'common/types/game';

import Lobby from 'server/gamesData/Lobby/Lobby';

Object.values(EGame).forEach((game) => {
  new Lobby({ game });
});
