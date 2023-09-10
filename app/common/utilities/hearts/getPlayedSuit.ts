import { Suit } from 'common/types/cards';
import { Game } from 'common/types/hearts';

export default function getPlayedSuit(gameInfo: Game): Suit | null {
  return gameInfo.hand?.turn
    ? gameInfo.players[gameInfo.hand.turn.startPlayerIndex].data.turn?.playedCard?.suit ?? null
    : null;
}
