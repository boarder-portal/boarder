import { BOTS_SUPPORTED_GAMES } from 'common/constants/game';

import { BotSupportedGameType } from 'common/types/game';

export function areBotsAvailable(game: unknown): game is BotSupportedGameType {
  return BOTS_SUPPORTED_GAMES.some((g) => g === game);
}
