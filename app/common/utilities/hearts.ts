import { ESuit, EValue, ICard } from 'common/types/cards';

import { isEqualCardsCallback } from 'common/utilities/cards/isEqualCards';
import card from 'common/utilities/cards/card';

export const isDeuceOfClubs = isEqualCardsCallback(card(EValue.DEUCE, ESuit.CLUBS));

export const isQueenOfSpades = isEqualCardsCallback(card(EValue.QUEEN, ESuit.SPADES));

export function isHeart(card: ICard): boolean {
  return card.suit === ESuit.HEARTS;
}
