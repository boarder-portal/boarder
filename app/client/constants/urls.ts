import { generatePath } from 'react-router-dom';

import { GameType } from 'common/types/game';

const urls = {
  home: '/',

  login: '/login',
  register: '/register',

  lobby: '/:game/lobby',
  game: '/:game/game/:gameId',
  getLobbyUrl: (game: GameType) => generatePath(urls.lobby, { game }),
  getGameUrl: (game: GameType, gameId: string | null | undefined) =>
    generatePath(urls.game, { game, gameId: gameId ?? null }),
} as const;

export default urls;
