import { AbilityCardDef, AbilityCardId, CardId, CardType } from 'common/types/games/outerMinds/cards';

import { addCardDefType } from 'common/utilities/games/outerMinds/cardDefs';

const CARD_DEFS: Record<AbilityCardId, Omit<AbilityCardDef, 'type'>> = {
  [CardId.BIG_HAND]: {
    isBonus: false,
  },
  [CardId.ALTERNATIVE_ENERGY]: {
    isBonus: true,
  },
};

export const ABILITY_CARD_DEFS: Record<AbilityCardId, AbilityCardDef> = addCardDefType(CardType.ABILITY, CARD_DEFS);
