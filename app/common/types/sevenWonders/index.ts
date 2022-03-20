import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

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

export interface ISevenWondersPlayer extends IPlayer {
  builtCards: ISevenWondersCard[];
  hand: ISevenWondersCard[];
}

export interface ISevenWondersGameInfoEvent {
  players: ISevenWondersPlayer[];
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
