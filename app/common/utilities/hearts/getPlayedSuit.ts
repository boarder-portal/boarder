import { IGame } from 'common/types/hearts';
import { ESuit } from 'common/types/cards';

export default function getPlayedSuit(gameInfo: IGame): ESuit | null {
  return gameInfo.hand?.turn
    ? gameInfo.players[gameInfo.hand.turn.startPlayerIndex].data.turn?.playedCard?.suit ?? null
    : null;
}
