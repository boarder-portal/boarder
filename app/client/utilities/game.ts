import { GameType } from 'common/types/game';

const GAMES = Object.values(GameType);

export function isGame(game: string | undefined): game is GameType {
  return GAMES.some((g) => g === game);
}
