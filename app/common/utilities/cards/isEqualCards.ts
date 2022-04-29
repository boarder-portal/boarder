import { ICard } from 'common/types/cards';

export default function isEqualCards(card1: ICard, card2: ICard): boolean {
  return card1.value === card2.value && card1.suit === card2.suit;
}
