import {
  BuildingCategory,
  CardId,
  CardType,
  ObservationCardDef,
  ObservationCardId,
  RealBuildingCategory,
} from 'common/types/games/outerMinds/cards';
import { Human } from 'common/types/games/outerMinds/common';

import { addCardDefType } from 'common/utilities/games/outerMinds/cardDefs';
import {
  getBuildingCategories,
  getBuildingDecrees,
  getBuildingGold,
  getBuildingHumans,
  isBuildingOfCategory,
} from 'common/utilities/games/outerMinds/cards/buildings';
import { citySome, iterateCity } from 'common/utilities/games/outerMinds/city';
import { isDefined } from 'common/utilities/is';
import { addElementsToSet } from 'common/utilities/set';

const CARD_DEFS: Record<ObservationCardId, Omit<ObservationCardDef, 'type'>> = {
  [CardId.HIGH_FIVE]: {
    isBonus: false,
    scores: [1, 2, 5],
    check: (city) => {
      const categories = new Set<BuildingCategory>();

      iterateCity(city, (building) => {
        addElementsToSet(categories, getBuildingCategories(building));
      });

      return categories.size === 5;
    },
  },

  [CardId.TWO_TIMES_TWO]: {
    isBonus: false,
    scores: [1, 2, 6],
    check: (city) => {
      let suitableBuildingsCount = 0;

      iterateCity(city, (building) => {
        if (getBuildingGold(building) === 2) {
          suitableBuildingsCount++;
        }
      });

      return suitableBuildingsCount === 2;
    },
  },

  [CardId.DOMINATING_KIND]: {
    isBonus: true,
    scores: [1, 3, 7, 15],
    check: (city, card) => {
      const { humans } = card;
      const dominatingHuman = humans.at(0);

      if (!isDefined(dominatingHuman)) {
        return false;
      }

      const humansCountMap = new Map<Human, number>();

      iterateCity(city, (building) => {
        for (const human of getBuildingHumans(building)) {
          humansCountMap.set(human, (humansCountMap.get(human) ?? 0) + 1);
        }
      });

      const dominatingCount = humansCountMap.get(dominatingHuman);

      if (!isDefined(dominatingCount)) {
        return false;
      }

      for (const [human, count] of humansCountMap.entries()) {
        if (human === dominatingHuman) {
          continue;
        }

        if (count >= dominatingCount) {
          return false;
        }
      }

      return true;
    },
  },

  [CardId.SINGLE_LANDMARK]: {
    isBonus: true,
    scores: [1, 2, 5, 10],
    check: (city, card) => {
      const { categories } = card;
      const category = categories.at(0);

      if (!isDefined(category)) {
        return false;
      }

      let decreesCount = 0;

      iterateCity(city, (building) => {
        if (isBuildingOfCategory(building, category)) {
          decreesCount += getBuildingDecrees(building);
        }
      });

      return decreesCount === 1;
    },
  },

  [CardId.EMERALD_CITY]: {
    isBonus: false,
    scores: [1, 3, 8],
    check: (city) => {
      let greenBuildingsCount = 0;

      iterateCity(city, (building) => {
        if (isBuildingOfCategory(building, BuildingCategory.COMMUNITY)) {
          greenBuildingsCount++;
        }
      });

      return greenBuildingsCount >= 3;
    },
  },

  [CardId.TWO_OF_EVERY_KIND]: {
    isBonus: false,
    scores: [1, 2, 5],
    check: (city) => {
      const humansCountMap = new Map<Human, number>();

      iterateCity(city, (building) => {
        for (const human of getBuildingHumans(building)) {
          humansCountMap.set(human, (humansCountMap.get(human) ?? 0) + 1);
        }
      });

      let missingHumansCount = 0;

      Object.values(Human).forEach((human) => {
        missingHumansCount += Math.min(0, 2 - (humansCountMap.get(human) ?? 0));
      });

      return missingHumansCount <= (humansCountMap.get(Human.ALIEN) ?? 0);
    },
  },

  [CardId.CATEGORICAL_BALANCE]: {
    isBonus: true,
    scores: [1, 2, 6, 13],
    check: (city, card) => {
      const { categories } = card;
      const category1 = categories.at(0);
      const category2 = categories.at(1);

      if (!isDefined(category1) || !isDefined(category2)) {
        return false;
      }

      const categoriesCountMap = new Map<RealBuildingCategory, number>();

      iterateCity(city, (building) => {
        getBuildingCategories(building).forEach((category) => {
          categoriesCountMap.set(category, (categoriesCountMap.get(category) ?? 0) + 1);
        });
      });

      return (categoriesCountMap.get(category1) ?? 0) === (categoriesCountMap.get(category2) ?? 0);
    },
  },

  [CardId.SMALL_FAMILY]: {
    isBonus: false,
    scores: [1, 3, 6],
    check: (city) => {
      return citySome(city, (building) => {
        const humans = getBuildingHumans(building);

        return (
          humans.includes(Human.MAN) &&
          humans.includes(Human.WOMAN) &&
          (humans.includes(Human.BOY) || humans.includes(Human.GIRL))
        );
      });
    },
  },
};

export const OBSERVATION_CARD_DEFS: Record<ObservationCardId, ObservationCardDef> = addCardDefType(
  CardType.OBSERVATION,
  CARD_DEFS,
);
