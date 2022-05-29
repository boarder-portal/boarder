import { ALL_CARDS } from 'common/constants/games/machiKoro';

import { ECardId, ICard } from 'common/types/machiKoro';

export default function getCard(id: ECardId): ICard {
  return ALL_CARDS.find((card) => card.id === id)!;
}
