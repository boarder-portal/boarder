import { Card } from 'common/types/cards';

export function isEqualCards(card1: Card, card2: Card | null | undefined): boolean {
  return card1.value === card2?.value && card1.suit === card2.suit;
}

export function isEqualCardsCallback(card1: Card): (card2: Card | null | undefined) => boolean {
  return (card2) => isEqualCards(card1, card2);
}
