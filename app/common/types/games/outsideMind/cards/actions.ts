import { CardId, CardType } from 'common/types/games/outsideMind/cards/common';

export type ActionCardId = CardId.ACADEMIC_LEAVE | CardId.MUTUAL_DISARMAMENT;

export interface ActionCardDef {
  type: CardType.ACTION;
}
