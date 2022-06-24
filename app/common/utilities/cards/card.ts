import { ESuit, EValue, ICard } from 'common/types/cards';

export default function card(value: EValue, suit: ESuit): ICard {
  return {
    value,
    suit,
  };
}
