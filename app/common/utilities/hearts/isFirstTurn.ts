import { Game } from 'common/types/games/hearts';

import { isDeuceOfClubs } from 'common/utilities/hearts/common';

export default function isFirstTurn(gameInfo: Game): boolean {
  return gameInfo.players.some(({ data }) => isDeuceOfClubs(data.turn?.playedCard)) ?? false;
}
