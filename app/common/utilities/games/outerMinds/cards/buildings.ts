import { BUILDING_CARD_DEFS } from 'common/constants/games/outerMinds/cards';

import {
  BuildingCardDef,
  BuildingCardId,
  BuildingCategory,
  CardId,
  CardType,
  CardWithInventory,
  RealBuildingCategory,
  StartingHumans,
} from 'common/types/games/outerMinds/cards';
import { City } from 'common/types/games/outerMinds/city';
import { Human } from 'common/types/games/outerMinds/common';

import { getCardDef } from 'common/utilities/games/outerMinds/cardDefs';
import hasOwnProperty from 'common/utilities/hasOwnProperty';

export function getBuildingCardDef(cardId: BuildingCardId): BuildingCardDef {
  return BUILDING_CARD_DEFS[cardId];
}

export function isBuildingCardId(cardId: CardId): cardId is BuildingCardId {
  return getCardDef(cardId).type === CardType.BUILDING;
}

export function flattenStartingHumans(startingHumans: StartingHumans): Human[] {
  const humans: Human[] = [];

  for (const key in startingHumans) {
    if (!hasOwnProperty(startingHumans, key)) {
      continue;
    }

    const human = key as Human;

    const count = startingHumans[human] ?? 0;

    for (let i = 0; i < count; i++) {
      humans.push(human);
    }
  }

  return humans;
}

export interface GetStartingCategoriesOptions {
  cardId: BuildingCardId;
  city: City;
}

export function getStartingCategories(options: GetStartingCategoriesOptions): RealBuildingCategory[] {
  const { cardId } = options;
  const cardDef = getBuildingCardDef(cardId);

  if (cardDef.category !== BuildingCategory.NEUTRAL) {
    return [cardDef.category];
  }

  return cardDef.getStartingCategories?.(options.city) ?? [];
}

export interface GetFreshBuildingOptions extends GetStartingCategoriesOptions {}

export function getFreshBuilding(options: GetFreshBuildingOptions): CardWithInventory<BuildingCardId> {
  const { cardId } = options;
  const cardDef = getBuildingCardDef(cardId);

  return {
    id: cardId,
    gold: cardDef.startingGold ?? 0,
    humans: flattenStartingHumans(cardDef.startingHumans),
    decrees: 1,
    categories: getStartingCategories(options),
    supporters: 0,
    cards: [],
  };
}
