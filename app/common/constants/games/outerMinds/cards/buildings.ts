import {
  BuildingCardDef,
  BuildingCardId,
  BuildingCategory,
  CardId,
  CardType,
} from 'common/types/games/outerMinds/cards';
import { Human } from 'common/types/games/outerMinds/common';

import { addCardDefType } from 'common/utilities/games/outerMinds/cardDefs';

const cardDefs: Record<BuildingCardId, Omit<BuildingCardDef, 'type'>> = {
  // Residential
  [CardId.NURSING_HOME]: {
    isStarting: false,
    isBonus: false,
    category: BuildingCategory.RESIDENTIAL,
    energy: 3,
    startingHumans: {
      [Human.GRANDMA]: 2,
      [Human.GRANDPA]: 2,
    },
  },

  // State
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

export const buildingCardDefs: Record<BuildingCardId, BuildingCardDef> = addCardDefType(CardType.BUILDING, cardDefs);
