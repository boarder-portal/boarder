import shuffle from 'lodash/shuffle';

import { DECK } from 'common/constants/games/common/cards';

import { ICard } from 'common/types/cards';

export default function shuffleDeck(): ICard[] {
  return shuffle(DECK);
}
