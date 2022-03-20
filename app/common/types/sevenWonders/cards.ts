import { TSevenWondersEffect } from 'common/types/sevenWonders/effects';
import { ISevenWondersResource } from 'common/types/sevenWonders/index';

export enum ESevenWonderCardId {
  LUMBER_YARD = 'LUMBER_YARD'
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
  resources: ISevenWondersResource[];
  coins: number;
  buildings: ESevenWonderCardId[];
}

export interface ISevenWondersCard {
  id: ESevenWonderCardId;
  type: ESevenWondersCardType;
  effects: TSevenWondersEffect[];
  price: ISevenWondersCardPrice;
  minPlayersCounts: number[];
}

