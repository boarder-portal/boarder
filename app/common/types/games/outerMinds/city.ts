import { BuildingCardId, CardWithInventory } from 'common/types/games/outerMinds/cards';

export type CityBuilding = CardWithInventory<BuildingCardId>;

export type City = CityBuilding[][];

export interface BuildingCell {
  row: number;
  col: number;
}

export enum CityQuadrant {
  NORTH_WEST = 'NORTH_WEST',
  NORTH_EAST = 'NORTH_EAST',
  SOUTH_WEST = 'SOUTH_WEST',
  SOUTH_EAST = 'SOUTH_EAST',
}
