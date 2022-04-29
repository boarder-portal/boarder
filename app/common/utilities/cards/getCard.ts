import { ESuit, EValue, ICard } from 'common/types/cards';

export default function getCard(value: EValue, suit: ESuit): ICard {
  return {
    value,
    suit,
  };
}
