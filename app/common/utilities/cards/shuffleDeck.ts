import shuffle from 'lodash/shuffle';

import { DECK } from 'common/constants/game/cards';

import { Card } from 'common/types/game/cards';

export default function shuffleDeck(): Card[] {
  return shuffle(DECK);
}
