import { CARDS_SORT } from 'common/constants/games/common/cards';

import { ICard } from 'common/types/cards';

export function isHigherCard(card1: ICard, card2: ICard, withSuit = true): boolean {
  return (
    CARDS_SORT.indexOf(card1.value) > CARDS_SORT.indexOf(card2.value)
    && (!withSuit || card1.suit === card2.suit)
  );
}

export function isLowerCard(card1: ICard, card2: ICard, withSuit = true): boolean {
  return (
    CARDS_SORT.indexOf(card1.value) < CARDS_SORT.indexOf(card2.value)
    && (!withSuit || card1.suit === card2.suit)
  );
}

export function getHighestCardIndex(cards: ICard[], startingIndex: number): number {
  let maxCard: ICard | null = null;
  let maxIndex = -1;

  cards.forEach((card, index) => {
    if (card.suit === cards[startingIndex].suit && (!maxCard || isHigherCard(card, maxCard))) {
      maxCard = card;
      maxIndex = index;
    }
  });

  return maxIndex;
}
