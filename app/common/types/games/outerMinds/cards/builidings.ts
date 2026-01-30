import { BaseCardDef, CardId, CardType } from 'common/types/games/outerMinds/cards/common';
import { City } from 'common/types/games/outerMinds/city';
import { Human } from 'common/types/games/outerMinds/common';

export enum BuildingCategory {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMUNITY = 'COMMUNITY',
  FINANCIAL = 'FINANCIAL',
  TRANSPORT = 'TRANSPORT',
  INDUSTRIAL = 'INDUSTRIAL',
  STATE = 'STATE',
  NEUTRAL = 'NEUTRAL',
}

export type RealBuildingCategory = Exclude<BuildingCategory, BuildingCategory.NEUTRAL>;

export type BuildingCardId = CardId.NURSING_HOME | CardId.PRISON;

export type StartingHumans = Partial<Record<Human, number>>;

export interface BuildingCardDef extends BaseCardDef {
  type: CardType.BUILDING;
  category: BuildingCategory;
  isStarting: boolean;
  energy: number;
  startingHumans: StartingHumans;
  startingGold?: number;
  getStartingCategories?: (city: City) => RealBuildingCategory[];
}
