import { ICard } from 'common/types/cards';

export function isEqualCards(card1: ICard, card2: ICard | null): boolean {
  return card1.value === card2?.value && card1.suit === card2.suit;
}

export function isEqualCardsCallback(card1: ICard): (card2: ICard | null) => boolean {
  return (card2) => isEqualCards(card1, card2);
}
