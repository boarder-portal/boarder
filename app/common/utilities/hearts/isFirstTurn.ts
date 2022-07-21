import { IGame } from 'common/types/hearts';

import { isDeuceOfClubs } from 'common/utilities/hearts/common';

export default function isFirstTurn(gameInfo: IGame): boolean {
  return gameInfo.players.some(({ data }) => isDeuceOfClubs(data.turn?.playedCard)) ?? false;
}
