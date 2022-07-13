import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {}

export enum EGameServerEvent {}

export interface IGameOptions extends ICommonGameOptions {}

export interface IPlayerData {}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
}

export interface IGame {
  players: IPlayer[];
}

export enum ETileType {
  SUIT = 'SUIT',
  DRAGON = 'DRAGON',
  WIND = 'WIND',
  FLOWER = 'FLOWER',
}

export enum ESuit {
  BAMBOOS = 'BAMBOOS',
  CHARACTERS = 'CHARACTERS',
  DOTS = 'DOTS',
}

export interface ISuitedTile {
  type: ETileType.SUIT;
  suit: ESuit;
  value: number;
}

export enum EDragon {
  GREEN = 'GREEN',
  RED = 'RED',
  WHITE = 'WHITE',
}

export interface IDragonTile {
  type: ETileType.DRAGON;
  color: EDragon;
}

export enum EWind {
  EAST = 'EAST',
  SOUTH = 'SOUTH',
  WEST = 'WEST',
  NORTH = 'NORTH',
}

export interface IWindTile {
  type: ETileType.WIND;
  side: EWind;
}

export interface IFlowerTile {
  type: ETileType.FLOWER;
  index: number;
}

export type TTile = ISuitedTile | IDragonTile | IWindTile | IFlowerTile;

export enum EFan {
  // 88 points
  BIG_FOUR_WINDS = 'BIG_FOUR_WINDS',
  BIG_THREE_DRAGONS = 'BIG_THREE_DRAGONS',
  ALL_GREEN = 'ALL_GREEN',
  NINE_GATES = 'NINE_GATES',
  FOUR_KONGS = 'FOUR_KONGS',
  SEVEN_SHIFTED_PAIRS = 'SEVEN_SHIFTED_PAIRS',
  THIRTEEN_ORPHANS = 'THIRTEEN_ORPHANS',

  // 64 points
  ALL_TERMINALS = 'ALL_TERMINALS',
  LITTLE_FOUR_WINDS = 'LITTLE_FOUR_WINDS',
  LITTLE_THREE_DRAGONS = 'LITTLE_THREE_DRAGONS',
  ALL_HONORS = 'ALL_HONORS',
  FOUR_CONCEALED_PUNGS = 'FOUR_CONCEALED_PUNGS',
  PURE_TERMINAL_CHOWS = 'PURE_TERMINAL_CHOWS',

  // 48 points
  QUADRUPLE_CHOWS = 'QUADRUPLE_CHOWS',
  FOUR_PURE_SHIFTED_PUNGS = 'FOUR_PURE_SHIFTED_PUNGS',

  // 32 points
  FOUR_PURE_SHIFTED_CHOWS = 'FOUR_PURE_SHIFTED_CHOWS',
  THREE_KONGS = 'THREE_KONGS',
  ALL_TERMINALS_AND_HONORS = 'ALL_TERMINALS_AND_HONORS',

  // 24 points
  SEVEN_PAIRS = 'SEVEN_PAIRS',
  GREATER_HONORS_AND_KNITTED_TILES = 'GREATER_HONORS_AND_KNITTED_TILES',
  ALL_EVEN_PUNGS = 'ALL_EVEN_PUNGS',
  FULL_FLUSH = 'FULL_FLUSH',
  PURE_TRIPLE_CHOW = 'PURE_TRIPLE_CHOW',
  PURE_SHIFTED_PUNGS = 'PURE_SHIFTED_PUNGS',
  UPPER_TILES = 'UPPER_TILES',
  MIDDLE_TILES = 'MIDDLE_TILES',
  LOWER_TILES = 'LOWER_TILES',

  // 16 points
  PURE_STRAIGHT = 'PURE_STRAIGHT',
  THREE_SUITED_TERMINAL_CHOWS = 'THREE_SUITED_TERMINAL_CHOWS',
  PURE_SHIFTED_CHOWS = 'PURE_SHIFTED_CHOWS',
  ALL_FIVES = 'ALL_FIVES',
  TRIPLE_PUNG = 'TRIPLE_PUNG',
  THREE_CONCEALED_PUNGS = 'THREE_CONCEALED_PUNGS',

  // 12 points
  LESSER_HONORS_AND_KNITTED_TILES = 'LESSER_HONORS_AND_KNITTED_TILES',
  KNITTED_STRAIGHT = 'KNITTED_STRAIGHT',
  UPPER_FOUR = 'UPPER_FOUR',
  LOWER_FOUR = 'LOWER_FOUR',
  BIG_THREE_WINDS = 'BIG_THREE_WINDS',

  // 8 points
  MIXED_STRAIGHT = 'MIXED_STRAIGHT',
  REVERSIBLE_TILES = 'REVERSIBLE_TILES',
  MIXED_TRIPLE_CHOW = 'MIXED_TRIPLE_CHOW',
  MIXED_SHIFTED_PUNGS = 'MIXED_SHIFTED_PUNGS',
  CHICKEN_HAND = 'CHICKEN_HAND',
  LAST_TILE_DRAW = 'LAST_TILE_DRAW',
  LAST_TILE_CLAIM = 'LAST_TILE_CLAIM',
  OUT_WITH_REPLACEMENT_TILE = 'OUT_WITH_REPLACEMENT_TILE',
  ROBBING_THE_KONG = 'ROBBING_THE_KONG',
  TWO_CONCEALED_KONGS = 'TWO_CONCEALED_KONGS',

  // 6 points
  ALL_PUNGS = 'ALL_PUNGS',
  HALF_FLUSH = 'HALF_FLUSH',
  MIXED_SHIFTED_CHOWS = 'MIXED_SHIFTED_CHOWS',
  ALL_TYPES = 'ALL_TYPES',
  MELDED_HAND = 'MELDED_HAND',
  TWO_DRAGON_PUNGS = 'TWO_DRAGON_PUNGS',

  // 4 points
  OUTSIDE_HAND = 'OUTSIDE_HAND',
  FULLY_CONCEALED_HAND = 'FULLY_CONCEALED_HAND',
  TWO_MELDED_KONGS = 'TWO_MELDED_KONGS',
  LAST_TILE = 'LAST_TILE',

  // 2 points
  DRAGON_PUNG = 'DRAGON_PUNG',
  PREVALENT_WIND = 'PREVALENT_WIND',
  SEAT_WIND = 'SEAT_WIND',
  CONCEALED_HAND = 'CONCEALED_HAND',
  ALL_CHOWS = 'ALL_CHOWS',
  TILE_HOG = 'TILE_HOG',
  DOUBLE_PUNG = 'DOUBLE_PUNG',
  TWO_CONCEALED_PUNGS = 'TWO_CONCEALED_PUNGS',
  CONCEALED_KONG = 'CONCEALED_KONG',
  ALL_SIMPLES = 'ALL_SIMPLES',

  // 1 point
  PURE_DOUBLE_CHOW = 'PURE_DOUBLE_CHOW',
  MIXED_DOUBLE_CHOW = 'MIXED_DOUBLE_CHOW',
  SHORT_STRAIGHT = 'SHORT_STRAIGHT',
  TWO_TERMINAL_CHOWS = 'TWO_TERMINAL_CHOWS',
  PUNG_OF_TERMINALS_OR_HONORS = 'PUNG_OF_TERMINALS_OR_HONORS',
  MELDED_KONG = 'MELDED_KONG',
  ONE_VOIDED_SUIT = 'ONE_VOIDED_SUIT',
  NO_HONORS = 'NO_HONORS',
  EDGE_WAIT = 'EDGE_WAIT',
  CLOSED_WAIT = 'CLOSED_WAIT',
  SINGLE_WAIT = 'SINGLE_WAIT',
  SELF_DRAWN = 'SELF_DRAWN',
  FLOWER_TILES = 'FLOWER_TILES',
}

export enum EFanType {
  SETS = 'SETS',
  HAND = 'HAND',
  SPECIAL = 'SPECIAL',
}

export enum ESet {
  PAIR = 'PAIR',
  PUNG = 'PUNG',
  KONG = 'KONG',
  CHOW = 'CHOW',
  KNITTED_CHOW = 'KNITTED_CHOW',
}

export interface ISet {
  type: ESet;
  tiles: TTile[];
  concealed: boolean;
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.MAHJONG> {}

export interface IServerEventMap extends ICommonServerEventMap<EGame.MAHJONG> {}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.MAHJONG]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
      result: void;
    };
  }
}
