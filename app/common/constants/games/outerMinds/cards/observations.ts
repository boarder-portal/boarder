import {
  BuildingCategory,
  CardId,
  CardType,
  ObservationCardDef,
  ObservationCardId,
} from 'common/types/games/outerMinds/cards';
import { Human } from 'common/types/games/outerMinds/common';

import { addCardDefType } from 'common/utilities/games/outerMinds/cardDefs';
import { citySome, iterateCity } from 'common/utilities/games/outerMinds/city';
import { addElementsToSet } from 'common/utilities/set';

const CARD_DEFS: Record<ObservationCardId, Omit<ObservationCardDef, 'type'>> = {
  [CardId.HIGH_FIVE]: {
    isBonus: false,
    scores: [1, 2, 5],
    check: (city) => {
      const categories = new Set<BuildingCategory>();

      iterateCity(city, (building) => {
        addElementsToSet(categories, building.categories);
      });

      return categories.size === 5;
    },
  },
  [CardId.SMALL_FAMILY]: {
    isBonus: false,
    scores: [1, 3, 6],
    check: (city) =>
      citySome(
        city,
        (building) =>
          building.humans.includes(Human.MAN) &&
          building.humans.includes(Human.WOMAN) &&
          (building.humans.includes(Human.BOY) || building.humans.includes(Human.GIRL)),
      ),
  },
};

export const OBSERVATION_CARD_DEFS: Record<ObservationCardId, ObservationCardDef> = addCardDefType(
  CardType.OBSERVATION,
  CARD_DEFS,
);
