import { BaseCardDef, CardId, CardType } from 'common/types/games/outerMinds/cards/common';
import { BuildingCell, City } from 'common/types/games/outerMinds/city';
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

export type ResidentialBuildingCardId = CardId.NURSING_HOME;

export type CommunityBuildingCardId = never;

export type FinancialBuildingCardId = never;

export type TransportBuildingCardId = CardId.TAXI_STATION;

export type IndustrialBuildingCardId = never;

export type StateBuildingCardId = CardId.PRISON;

export type NeutralBuildingCardId = never;

export type BuildingCardId =
  | ResidentialBuildingCardId
  | CommunityBuildingCardId
  | FinancialBuildingCardId
  | TransportBuildingCardId
  | IndustrialBuildingCardId
  | StateBuildingCardId
  | NeutralBuildingCardId;

export type StartingHumans = Partial<Record<Human, number>>;

export interface Trip {
  from: BuildingCell;
  to: BuildingCell;
  maxHumansCount?: number;
}

export interface GetAllPossibleTripsOptions {
  buildingCell: BuildingCell;
  pointCell: BuildingCell;
}

export interface BuildingCardDef extends BaseCardDef {
  type: CardType.BUILDING;
  category: BuildingCategory;
  isStarting: boolean;
  energy: number;
  startingHumans: StartingHumans;
  startingGold?: number;
  getStartingCategories?: (city: City) => RealBuildingCategory[];
  getAllPossibleTrips?: (options: GetAllPossibleTripsOptions) => Trip[];
}
