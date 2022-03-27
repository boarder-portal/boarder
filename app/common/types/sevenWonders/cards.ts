import { TSevenWondersEffect } from 'common/types/sevenWonders/effects';
import { ISevenWondersPrice } from 'common/types/sevenWonders/index';

export enum ESevenWonderCardId {
  // manufactured goods
  // age 1 & 2
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
  // age 2
  SAWMILL = 'SAWMILL',
  QUARRY = 'QUARRY',
  BRICKYARD = 'BRICKYARD',
  FOUNDRY = 'FOUNDRY',

  // civilian
  // age 1
  PAWNSHOP = 'PAWNSHOP',
  BATHS = 'BATHS',
  ALTAR = 'ALTAR',
  THEATER = 'THEATER',
  // age 2
  AQUEDUCT = 'AQUEDUCT',
  TEMPLE = 'TEMPLE',
  STATUE = 'STATUE',
  COURTHOUSE = 'COURTHOUSE',

  // commercial
  // age 1
  TAVERN = 'TAVERN',
  EAST_TRADING_POST = 'EAST_TRADING_POST',
  WEST_TRADING_POST = 'WEST_TRADING_POST',
  MARKETPLACE = 'MARKETPLACE',
  // age 2
  FORUM = 'FORUM',
  CARAVANSERY = 'CARAVANSERY',
  VINEYARD = 'VINEYARD',
  BAZAR = 'BAZAR',

  // military
  // age 1
  STOCKADE = 'STOCKADE',
  BARRACKS = 'BARRACKS',
  GUARD_TOWER = 'GUARD_TOWER',
  // age 2
  WALLS = 'WALLS',
  TRAINING_GROUND = 'TRAINING_GROUND',
  STABLES = 'STABLES',
  ARCHERY_RANGE = 'ARCHERY_RANGE',

  // scientific
  // age 1
  APOTHECARY = 'APOTHECARY',
  WORKSHOP = 'WORKSHOP',
  SCRIPTORIUM = 'SCRIPTORIUM',
  // age 2
  DISPENSARY = 'DISPENSARY',
  LABORATORY = 'LABORATORY',
  LIBRARY = 'LIBRARY',
  SCHOOL = 'SCHOOL',
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

export interface ISevenWondersCardPrice extends ISevenWondersPrice {
  buildings?: ESevenWonderCardId[];
}

export interface ISevenWondersCard {
  id: ESevenWonderCardId;
  type: ESevenWondersCardType;
  effects: TSevenWondersEffect[];
  price?: ISevenWondersCardPrice;
  minPlayersCounts: number[];
}

