import Lobby from '../game/Lobby';

import { games } from '../../shared/constants';
import { gamesList, getLobbyNsp } from '../../shared/games';

export default async (io) => {
  for (const game of gamesList) {
    const {
      playersCount
    } = games[game];
    const { default: Game } = await import(`../games/${game}`);

    new Lobby({
      gameName: game,
      io,
      socket: io.of(getLobbyNsp(game)),
      rooms: {},
      playersCount,
      Game
    });
  }
};
