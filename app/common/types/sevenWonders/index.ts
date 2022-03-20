import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { TSevenWondersEffect } from 'common/types/sevenWonders/effects';

export enum ESevenWondersGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',

  GAME_INFO = 'GAME_INFO',
}

export enum ESevenWondersScientificSymbol {
  GEAR = 'GEAR',
  COMPASS = 'COMPASS',
  TABLET = 'TABLET',
}

export interface ISevenWondersGameOptions extends ICommonGameOptions {}

export enum ESevenWondersCity {
  RHODOS = 'RHODOS',
  ALEXANDRIA = 'ALEXANDRIA',
  EPHESOS = 'EPHESOS',
  BABYLON = 'BABYLON',
  OLYMPIA = 'OLYMPIA',
  HALIKARNASSOS = 'HALIKARNASSOS',
  GIZAH = 'GIZAH',
}

export interface ISevenWondersWonder {
  price: ISevenWondersPrice;
  effects: TSevenWondersEffect[];
}

export interface ISevenWondersCity {
  type: ESevenWondersCity;
  effect: TSevenWondersEffect;
  wonders: ISevenWondersWonder[];
}

export interface ISevenWondersPlayer extends IPlayer {
  builtCards: ISevenWondersCard[];
  hand: ISevenWondersCard[];
  city: ESevenWondersCity;
  builtWondersIndexes: number[];
  coins: number;
  warTokensPoints: number[];
}

export interface ISevenWondersGameInfoEvent {
  players: ISevenWondersPlayer[];
  discard: ISevenWondersCard[];
}

export enum ESevenWondersResource {
  WOOD = 'WOOD',
  ORE = 'ORE',
  CLAY = 'CLAY',
  STONE = 'STONE',

  GLASS = 'GLASS',
  LOOM = 'LOOM',
  PAPYRUS = 'PAPYRUS',
}

export interface ISevenWondersResource {
  type: ESevenWondersResource;
  count: number;
}

export interface ISevenWondersScientificSymbol {
  type: ESevenWondersScientificSymbol;
  count: number;
}

export enum ESevenWondersNeighbor {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface ISevenWondersPrice {
  resources?: ISevenWondersResource[];
  coins?: number;
}
