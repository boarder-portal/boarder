import {
  BuildingCardDef,
  BuildingCategory,
  CardId,
  ResidentialBuildingCardId,
} from 'common/types/games/outerMinds/cards';
import { Human } from 'common/types/games/outerMinds/common';

export const RESIDENTIAL_CARD_DEFS: Record<ResidentialBuildingCardId, Omit<BuildingCardDef, 'type'>> = {
  // TODO: request aliens identification
  // TODO: effects
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
};
