import { DECK } from 'common/constants/game/cards';

import { Card, Suit, Value } from 'common/types/game/cards';
import { PassDirection } from 'common/types/games/hearts';

import card from 'common/utilities/cards/card';
import { isEqualCardsCallback } from 'common/utilities/cards/isEqualCards';

export const PASS_DIRECTIONS: Record<number, PassDirection[]> = {
  2: [PassDirection.LEFT, PassDirection.NONE],
  3: [PassDirection.LEFT, PassDirection.RIGHT, PassDirection.NONE],
  4: [PassDirection.LEFT, PassDirection.RIGHT, PassDirection.ACROSS, PassDirection.NONE],
};

export const DECKS: Record<number, Card[]> = {
  2: DECK,
  3: [...DECK],
  4: DECK,
};

const removedCardIndex = DECKS[3].findIndex(isEqualCardsCallback(card(Value.DEUCE, Suit.DIAMONDS)));

if (removedCardIndex !== -1) {
  DECKS[3].splice(removedCardIndex, 1);
}
