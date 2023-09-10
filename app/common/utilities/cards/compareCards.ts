import { CARDS_SORT } from 'common/constants/game/cards';

import { Card } from 'common/types/game/cards';

export function isHigherCard(card1: Card, card2: Card, withSuit = true): boolean {
  return CARDS_SORT.indexOf(card1.value) > CARDS_SORT.indexOf(card2.value) && (!withSuit || card1.suit === card2.suit);
}

export function isLowerCard(card1: Card, card2: Card, withSuit = true): boolean {
  return CARDS_SORT.indexOf(card1.value) < CARDS_SORT.indexOf(card2.value) && (!withSuit || card1.suit === card2.suit);
}

export function getHighestCardIndex(cards: Card[], startingIndex: number): number {
  let maxCard: Card | null = null;
  let maxIndex = -1;

  cards.forEach((card, index) => {
    if (card.suit === cards[startingIndex].suit && (!maxCard || isHigherCard(card, maxCard))) {
      maxCard = card;
      maxIndex = index;
    }
  });

  return maxIndex;
}
