import { Suit } from 'common/types/game/cards';
import { Game } from 'common/types/games/hearts';

export default function getPlayedSuit(gameInfo: Game): Suit | null {
  return gameInfo.hand?.turn
    ? gameInfo.players[gameInfo.hand.turn.startPlayerIndex].data.turn?.playedCard?.suit ?? null
    : null;
}
