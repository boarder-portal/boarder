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
  // age 3
  PANTHEON = 'PANTHEON',
  GARDENS = 'GARDENS',
  TOWN_HALL = 'TOWN_HALL',
  PALACE = 'PALACE',
  SENATE = 'SENATE',

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
  // age 3
  HAVEN = 'HAVEN',
  LIGHTHOUSE = 'LIGHTHOUSE',
  CHAMBER_OF_COMMERCE = 'CHAMBER_OF_COMMERCE',
  ARENA = 'ARENA',

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
  // age 3
  FORTIFICATIONS = 'FORTIFICATIONS',
  CIRCUS = 'CIRCUS',
  ARSENAL = 'ARSENAL',
  SIEGE_WORKSHOP = 'SIEGE_WORKSHOP',

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
  // age 3
  LODGE = 'LODGE',
  OBSERVATORY = 'OBSERVATORY',
  UNIVERSITY = 'UNIVERSITY',
  ACADEMY = 'ACADEMY',
  STUDY = 'STUDY',

  // guilds
  WORKERS_GUILD = 'WORKERS_GUILD',
  CRAFTSMENS_GUILD = 'CRAFTSMENS_GUILD',
  TRADERS_GUILD = 'TRADERS_GUILD',
  PHILOSOPHERS_GUILD = 'PHILOSOPHERS_GUILD',
  SPIES_GUILD = 'SPIES_GUILD',
  STRATEGISTS_GUILD = 'STRATEGISTS_GUILD',
  SHIPOWNERS_GUILD = 'SHIPOWNERS_GUILD',
  SCIENTISTS_GUILD = 'SCIENTISTS_GUILD',
  BUILDERS_GUILD = 'BUILDERS_GUILD',
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

