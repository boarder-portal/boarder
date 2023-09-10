import { Card, Suit, Value } from 'common/types/game/cards';

export default function card(value: Value, suit: Suit): Card {
  return {
    value,
    suit,
  };
}
