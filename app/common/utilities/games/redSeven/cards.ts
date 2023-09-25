import { COLOR_VALUES } from 'common/constants/games/redSeven';

import { Card } from 'common/types/games/redSeven';

export function isEqualCards(card1: Card, card2: Card | null | undefined): boolean {
  return card1.value === card2?.value && card1.color === card2.color;
}

export function isEqualCardsCallback(card1: Card): (card2: Card | null | undefined) => boolean {
  return (card2) => isEqualCards(card1, card2);
}

export function getCardValue(card: Card | null | undefined): number {
  if (!card) {
    return 0;
  }

  return card.value * 7 + COLOR_VALUES[card.color];
}

export function getCardsScoreValue(cards: Card[]): number {
  return cards.reduce((score, card) => score + card.value, 0);
}

export function getHighestCard(cards: Card[]): Card | null {
  let highestCard: Card | null = null;
  let highestCardValue = -Infinity;

  cards.forEach((card) => {
    const cardValue = getCardValue(card);

    if (cardValue > highestCardValue) {
      highestCard = card;
      highestCardValue = cardValue;
    }
  });

  return highestCard;
}

export function getCardsHighestValue(cards: Card[]): number {
  return getCardValue(getHighestCard(cards));
}

export function compareCards(cards1: Card[], cards2: Card[]): boolean {
  return (
    cards1.length > cards2.length ||
    (cards1.length === cards2.length && getCardsHighestValue(cards1) > getCardsHighestValue(cards2))
  );
}
