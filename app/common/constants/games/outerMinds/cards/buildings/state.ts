import { BuildingCardDef, BuildingCategory, CardId, StateBuildingCardId } from 'common/types/games/outerMinds/cards';
import { Human } from 'common/types/games/outerMinds/common';

export const STATE_CARD_DEFS: Record<StateBuildingCardId, Omit<BuildingCardDef, 'type'>> = {
  // TODO: effects
  [CardId.PRISON]: {
    isStarting: false,
    isBonus: false,
    category: BuildingCategory.STATE,
    energy: 4,
    startingHumans: {
      [Human.MAN]: 2,
    },
  },
};
