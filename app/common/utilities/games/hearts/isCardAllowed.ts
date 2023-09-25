import { Card, Suit } from 'common/types/game/cards';

import { isHeart, isQueenOfSpades } from 'common/utilities/games/hearts/common';

export interface AllowedCardOptions {
  card: Card;
  suit: Suit | null;
  hand: Card[];
  heartsEnteredPlay: boolean;
  isFirstTurn: boolean;
}

export default function isCardAllowed(options: AllowedCardOptions): boolean {
  const { card, suit, hand, heartsEnteredPlay, isFirstTurn } = options;

  if (hand.some((card) => card.suit === suit)) {
    return card.suit === suit;
  }

  if (isQueenOfSpades(card)) {
    return !isFirstTurn;
  }

  if (!isHeart(card)) {
    return true;
  }

  return !isFirstTurn && (suit !== null || heartsEnteredPlay || hand.every(isHeart));
}
