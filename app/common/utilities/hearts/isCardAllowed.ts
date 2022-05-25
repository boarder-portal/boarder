import { ESuit, ICard } from 'common/types/cards';

import { isHeart, isQueenOfSpades } from 'common/utilities/hearts';

export interface IAllowedCardOptions {
  card: ICard;
  suit: ESuit | null;
  hand: ICard[];
  heartsEnteredPlay: boolean;
  isFirstTurn: boolean;
}

export default function isCardAllowed(options: IAllowedCardOptions): boolean {
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
