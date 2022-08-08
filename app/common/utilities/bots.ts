import { BOTS_SUPPORTED_GAMES } from 'common/constants/games/common';

export function areBotsAvailable(game: unknown): game is typeof BOTS_SUPPORTED_GAMES[number] {
  return BOTS_SUPPORTED_GAMES.some((g) => g === game);
}
