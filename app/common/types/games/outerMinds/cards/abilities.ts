import { BaseCardDef, CardId, CardType } from 'common/types/games/outerMinds/cards/common';

export type AbilityCardId = CardId.ALTERNATIVE_ENERGY | CardId.BIG_HAND;

export interface AbilityCardDef extends BaseCardDef {
  type: CardType.ABILITY;
}
