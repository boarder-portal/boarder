import { TSevenWondersEffect } from 'common/types/sevenWonders/effects';
import { ISevenWondersResource } from 'common/types/sevenWonders/index';

export enum ESevenWonderCardId {
  // manufactured goods
  LOOM = 'LOOM',
  GLASSWORKS = 'GLASSWORKS',
  PRESS = 'PRESS',

  // raw materials
  // age 1
  LUMBER_YARD = 'LUMBER_YARD',
  STONE_PIT = 'STONE_PIT',
  CLAY_POOL = 'CLAY_POOL',
  ORE_VEIN = 'ORE_VEIN',
  TREE_FARM = 'TREE_FARM',
  EXCAVATION = 'EXCAVATION',
  CLAY_PIT = 'CLAY_PIT',
  TIMBER_YARD = 'TIMBER_YARD',
  FOREST_CAVE = 'FOREST_CAVE',
  MINE = 'MINE',

  // civilian
  // age 1
  PAWN_SHOP = 'PAWN_SHOP',
  BATHS = 'BATHS',
  ALTAR = 'ALTAR',
  THEATER = 'THEATER',

  // commercial
  // age 1
  TAVERN = 'TAVERN',
  EAST_TRADING_POST = 'EAST_TRADING_POST',
  WEST_TRADING_POST = 'WEST_TRADING_POST',
  MARKETPLACE = 'MARKETPLACE',

  // military
  // age 1
  STOCKADE = 'STOCKADE',
  BARRACKS = 'BARRACKS',
  GUARD_TOWER = 'GUARD_TOWER',

  // scientific
  // age 1
  APOTHECARY = 'APOTHECARY',
  WORKSHOP = 'WORKSHOP',
  SCRIPTORIUM = 'SCRIPTORIUM',
}

export enum ESevenWondersPlayerDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  SELF = 'SELF',
  ALL = 'ALL',
}

export enum ESevenWondersCardType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  MANUFACTURED_GOODS = 'MANUFACTURED_GOODS',
  CIVILIAN = 'CIVILIAN',
  SCIENTIFIC = 'SCIENTIFIC',
  COMMERCIAL = 'COMMERCIAL',
  MILITARY = 'MILITARY',
  GUILD = 'GUILD',
  LEADER = 'LEADER',
}

export interface ISevenWondersCardPrice {
  resources?: ISevenWondersResource[];
  coins?: number;
  buildings?: ESevenWonderCardId[];
}

export interface ISevenWondersCard {
  id: ESevenWonderCardId;
  type: ESevenWondersCardType;
  effects: TSevenWondersEffect[];
  price?: ISevenWondersCardPrice;
  minPlayersCounts: number[];
}

