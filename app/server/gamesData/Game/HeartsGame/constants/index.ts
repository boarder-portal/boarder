import { DECK } from 'common/constants/games/common/cards';

import { ESuit, EValue, ICard } from 'common/types/cards';
import { EPassDirection } from 'common/types/hearts';

import { isEqualCardsCallback } from 'common/utilities/cards/isEqualCards';
import getCard from 'common/utilities/cards/getCard';

export const PASS_DIRECTIONS: Record<number, EPassDirection[]> = {
  2: [EPassDirection.LEFT, EPassDirection.NONE],
  3: [EPassDirection.LEFT, EPassDirection.RIGHT, EPassDirection.NONE],
  4: [EPassDirection.LEFT, EPassDirection.RIGHT, EPassDirection.ACROSS, EPassDirection.NONE],
};

export const DECKS: Record<number, ICard[]> = {
  2: DECK,
  3: [...DECK],
  4: DECK,
};

const removedCardIndex = DECKS[3].findIndex(isEqualCardsCallback(getCard(EValue.DEUCE, ESuit.DIAMONDS)));

if (removedCardIndex !== -1) {
  DECKS[3].splice(removedCardIndex, 1);
}
