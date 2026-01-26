import { CardId, CardType } from 'common/types/games/outsideMind/cards/common';

export type AbilityCardId = CardId.ALTERNATIVE_ENERGY | CardId.BIG_HAND;

export interface AbilityCardDef {
  type: CardType.ABILITY;
}
