import { Card, Suit, Value } from 'common/types/cards';

export const CARDS_SORT = '23456789TJQKA';

export const DECK: Card[] = Object.values(Suit)
  .map((suit) =>
    Object.values(Value).map((value) => ({
      suit,
      value,
    })),
  )
  .flat();
