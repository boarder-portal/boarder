import { ISetCard } from 'common/types/set';

import isSet from 'server/gamesData/Game/SetGame/utilities/isSet';

export default function isAnySet(cards: ISetCard[]): boolean {
  for (let i = 0; i < cards.length; i++) {
    const firstCard = cards[i];

    for (let j = i + 1; j < cards.length; j++) {
      const secondCard = cards[j];

      for (let k = j + 1; k < cards.length; k++) {
        const thirdCard = cards[k];

        if (isSet([firstCard, secondCard, thirdCard])) {
          return true;
        }
      }
    }
  }

  return false;
}
