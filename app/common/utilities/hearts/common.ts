import { Card, Suit, Value } from 'common/types/cards';

import card from 'common/utilities/cards/card';
import { isEqualCardsCallback } from 'common/utilities/cards/isEqualCards';

export const isDeuceOfClubs = isEqualCardsCallback(card(Value.DEUCE, Suit.CLUBS));

export const isQueenOfSpades = isEqualCardsCallback(card(Value.QUEEN, Suit.SPADES));

export function isHeart(card: Card): boolean {
  return card.suit === Suit.HEARTS;
}
