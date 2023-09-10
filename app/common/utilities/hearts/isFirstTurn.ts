import { Game } from 'common/types/hearts';

import { isDeuceOfClubs } from 'common/utilities/hearts/common';

export default function isFirstTurn(gameInfo: Game): boolean {
  return gameInfo.players.some(({ data }) => isDeuceOfClubs(data.turn?.playedCard)) ?? false;
}
