import { BaseCardDef, CardId, CardType } from 'common/types/games/outerMinds/cards/common';

export type ActionCardId = CardId.ACADEMIC_LEAVE | CardId.MUTUAL_DISARMAMENT | CardId.RENOVATION;

export interface ActionCardDef extends BaseCardDef {
  type: CardType.ACTION;
}
