import { ESuit, EValue, ICard } from 'common/types/cards';

import { isEqualCardsCallback } from 'common/utilities/cards/isEqualCards';
import getCard from 'common/utilities/cards/getCard';

export const isQueenOfSpades = isEqualCardsCallback(getCard(EValue.QUEEN, ESuit.SPADES));

export function isHeart(card: ICard): boolean {
  return card.suit === ESuit.HEARTS;
}
