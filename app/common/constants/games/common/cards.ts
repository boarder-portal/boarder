import { ESuit, EValue, ICard } from 'common/types/cards';

export const CARDS_SORT = '23456789TJQKA';

export const DECK: ICard[] = Object.values(ESuit)
  .map((suit) =>
    Object.values(EValue).map((value) => ({
      suit,
      value,
    })),
  )
  .flat();
