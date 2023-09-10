import shuffle from 'lodash/shuffle';

import { DECK } from 'common/constants/games/common/cards';

import { Card } from 'common/types/cards';

export default function shuffleDeck(): Card[] {
  return shuffle(DECK);
}
