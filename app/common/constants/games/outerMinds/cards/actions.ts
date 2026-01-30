import { ActionCardDef, ActionCardId, CardId, CardType } from 'common/types/games/outerMinds/cards';

import { addCardDefType } from 'common/utilities/games/outerMinds/cardDefs';

const cardDefs: Record<ActionCardId, Omit<ActionCardDef, 'type'>> = {
  [CardId.ACADEMIC_LEAVE]: {
    isBonus: false,
  },
  [CardId.MUTUAL_DISARMAMENT]: {
    isBonus: true,
  },
};

export const actionCardDefs: Record<ActionCardId, ActionCardDef> = addCardDefType(CardType.ACTION, cardDefs);
