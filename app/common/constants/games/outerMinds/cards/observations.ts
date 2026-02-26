import { CITY_QUADRANT_COUNT } from 'common/constants/games/outerMinds/city';
import { ALL_REAL_HUMANS } from 'common/constants/games/outerMinds/humans';

import {
  BuildingCategory,
  CardId,
  CardType,
  ObservationCardDef,
  ObservationCardId,
  RealBuildingCategory,
} from 'common/types/games/outerMinds/cards';
import { CityQuadrant } from 'common/types/games/outerMinds/city';
import { Human } from 'common/types/games/outerMinds/common';

import { addCardDefType } from 'common/utilities/games/outerMinds/cardDefs';
import {
  buildingHasHumans,
  getBuildingCategories,
  getBuildingDecrees,
  getBuildingGold,
  getBuildingHumans,
  isBuildingOfCategory,
} from 'common/utilities/games/outerMinds/cards/buildings';
import { citySome, getCellCityQuadrant, iterateCity } from 'common/utilities/games/outerMinds/city';
import { humansIncludeRealHumans } from 'common/utilities/games/outerMinds/humans';
import { isDefined } from 'common/utilities/is';
import { addElementsToSet } from 'common/utilities/set';

const CARD_DEFS: Record<ObservationCardId, Omit<ObservationCardDef, 'type'>> = {
  [CardId.HIGH_FIVE]: {
    isBonus: false,
    scores: [1, 2, 5],
    check: (city) => {
      const categories = new Set<BuildingCategory>();

      iterateCity(city, ({ building }) => {
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

      iterateCity(city, ({ building }) => {
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
    check: (city, { card }) => {
      const { humans } = card;
      const dominatingHuman = humans.at(0);

      if (!isDefined(dominatingHuman)) {
        return false;
      }

      const humansCountMap = new Map<Human, number>();

      iterateCity(city, ({ building }) => {
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
    check: (city, { card }) => {
      const { categories } = card;
      const category = categories.at(0);

      if (!isDefined(category)) {
        return false;
      }

      let decreesCount = 0;

      iterateCity(city, ({ building }) => {
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

      iterateCity(city, ({ building }) => {
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
      const allCityHumans: Human[] = [];

      iterateCity(city, ({ building }) => {
        allCityHumans.push(...getBuildingHumans(building));
      });

      return humansIncludeRealHumans(allCityHumans, [...ALL_REAL_HUMANS, ...ALL_REAL_HUMANS]);
    },
  },

  [CardId.CATEGORICAL_BALANCE]: {
    isBonus: true,
    scores: [1, 2, 6, 13],
    check: (city, { card }) => {
      const { categories } = card;
      const category1 = categories.at(0);
      const category2 = categories.at(1);

      if (!isDefined(category1) || !isDefined(category2)) {
        return false;
      }

      const categoriesCountMap = new Map<RealBuildingCategory, number>();

      iterateCity(city, ({ building }) => {
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
      return citySome(
        city,
        ({ building }) =>
          buildingHasHumans(building, [Human.MAN, Human.WOMAN, Human.BOY]) ||
          buildingHasHumans(building, [Human.MAN, Human.WOMAN, Human.GIRL]),
      );
    },
  },

  [CardId.MOBILE_CITY]: {
    isBonus: false,
    scores: [1, 3, 7],
    check: (_city, { getAllPossibleCityTrips }) => {
      const quadrants = new Set<CityQuadrant>();

      for (const { from, to } of getAllPossibleCityTrips()) {
        quadrants.add(getCellCityQuadrant(from));
        quadrants.add(getCellCityQuadrant(to));

        if (quadrants.size === CITY_QUADRANT_COUNT) {
          return true;
        }
      }

      return false;
    },
  },

  [CardId.GRANDPAS_FORTUNE]: {
    isBonus: false,
    scores: [1, 3, 7],
    check: (city) => {
      return citySome(city, ({ building }) => {
        if (getBuildingGold(building) <= 2) {
          return false;
        }

        return (
          buildingHasHumans(building, [Human.GRANDPA, Human.GIRL]) ||
          buildingHasHumans(building, [Human.GRANDPA, Human.BOY])
        );
      });
    },
  },
};

export const OBSERVATION_CARD_DEFS: Record<ObservationCardId, ObservationCardDef> = addCardDefType(
  CardType.OBSERVATION,
  CARD_DEFS,
);
