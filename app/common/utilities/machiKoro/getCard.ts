import { ALL_CARDS } from 'common/constants/games/machiKoro';

import { Card, CardId } from 'common/types/machiKoro';

export default function getCard(id: CardId): Card {
  return ALL_CARDS.find((card) => card.id === id)!;
}
