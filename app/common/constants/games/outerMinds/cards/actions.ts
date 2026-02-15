import { ActionCardDef, ActionCardId, CardId, CardType } from 'common/types/games/outerMinds/cards';

import { addCardDefType } from 'common/utilities/games/outerMinds/cardDefs';

const CARD_DEFS: Record<ActionCardId, Omit<ActionCardDef, 'type'>> = {
  // TODO: effects
  [CardId.ACADEMIC_LEAVE]: {
    isBonus: false,
  },
  // TODO: effects
  [CardId.MUTUAL_DISARMAMENT]: {
    isBonus: true,
  },
  // TODO: effects
  [CardId.RENOVATION]: {
    isBonus: false,
  },
};

export const ACTION_CARD_DEFS: Record<ActionCardId, ActionCardDef> = addCardDefType(CardType.ACTION, CARD_DEFS);
