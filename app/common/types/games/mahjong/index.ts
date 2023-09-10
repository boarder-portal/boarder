import {
  BaseGameOptions,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
  GamePlayer,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  DISCARD_TILE = 'DISCARD_TILE',
  DECLARE = 'DECLARE',
  CHANGE_TILE_INDEX = 'CHANGE_TILE_INDEX',
  READY_FOR_NEW_HAND = 'READY_FOR_NEW_HAND',
}

export enum GameServerEventType {}

export interface GameOptions extends BaseGameOptions {
  handsCount: HandsCount;
}

export interface GamePlayerData {}

export interface PlayerData extends GamePlayerData {
  round: RoundPlayerData | null;
  hand: HandPlayerData | null;
  turn: TurnPlayerData | null;
}

export interface Player extends GamePlayer<GameType.MAHJONG> {
  data: PlayerData;
}

export interface Game {
  players: Player[];
  resultsByHand: HandResult[];
  round: Round | null;
}

export interface HandResult {
  mahjong: HandMahjong | null;
  winnerIndex: number;
  scores: number[];
}

export interface Round {
  wind: WindSide | null;
  handIndex: number;
  hand: Hand | null;
}

export interface RoundPlayerData {
  wind: WindSide;
}

export interface Hand {
  activePlayerIndex: number;
  tilesLeft: number;
  isLastInGame: boolean;
  phase: HandPhase;
  turn: Turn | null;
}

export enum HandPhase {
  REPLACE_FLOWERS = 'REPLACE_FLOWERS',
  PLAY = 'PLAY',
}

export interface GameDeclaredMeldedSet {
  set: MeldedSet;
  stolenTileIndex: number;
  stolenFrom: number;
}

export interface GameDeclaredConcealedSet {
  set: ConcealedSet<KongSet>;
  stolenTileIndex: number;
  stolenFrom: null;
}

export type GameDeclaredSet = GameDeclaredMeldedSet | GameDeclaredConcealedSet;

export interface HandPlayerData {
  hand: Tile[];
  declaredSets: GameDeclaredSet[];
  flowers: FlowerTile[];
  discard: Tile[];
  readyForNewHand: boolean;
}

export interface Turn {
  currentTile: Tile | null;
  currentTileIndex: number;
  isReplacementTile: boolean;
  declareInfo: DeclareInfo | null;
}

export interface DeclareInfo {
  tile: PlayableTile;
  isRobbingKong: boolean;
}

export type DeclareDecision =
  | {
      type: 'set';
      set: DeclaredSet;
    }
  | {
      type: 'flower';
      flower: FlowerTile;
    }
  | 'mahjong'
  | 'pass'
  | null;

export interface TurnPlayerData {
  declareDecision: DeclareDecision;
}

export enum HandsCount {
  ONE = 'ONE',
  FOUR = 'FOUR',
  SIXTEEN = 'SIXTEEN',
}

export enum TileType {
  SUIT = 'SUIT',
  DRAGON = 'DRAGON',
  WIND = 'WIND',
  FLOWER = 'FLOWER',
}

export enum Suit {
  BAMBOOS = 'BAMBOOS',
  CHARACTERS = 'CHARACTERS',
  DOTS = 'DOTS',
}

export interface SuitedTile {
  type: TileType.SUIT;
  suit: Suit;
  value: number;
}

export enum DragonColor {
  RED = 'RED',
  GREEN = 'GREEN',
  WHITE = 'WHITE',
}

export interface DragonTile {
  type: TileType.DRAGON;
  color: DragonColor;
}

export enum WindSide {
  EAST = 'EAST',
  SOUTH = 'SOUTH',
  WEST = 'WEST',
  NORTH = 'NORTH',
}

export interface WindTile {
  type: TileType.WIND;
  side: WindSide;
}

export interface FlowerTile {
  type: TileType.FLOWER;
  index: number;
}

export type Tile = SuitedTile | DragonTile | WindTile | FlowerTile;

export type PlayableTile = SuitedTile | DragonTile | WindTile;

export enum FanKind {
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
  QUADRUPLE_CHOW = 'QUADRUPLE_CHOW',
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

export enum FanType {
  SETS = 'SETS',
  HAND = 'HAND',
  SPECIAL = 'SPECIAL',
}

export enum SetType {
  PAIR = 'PAIR',
  PUNG = 'PUNG',
  KONG = 'KONG',
  CHOW = 'CHOW',
  KNITTED_CHOW = 'KNITTED_CHOW',
}

export enum SetConcealedType {
  CONCEALED = 'CONCEALED',
  MELDED = 'MELDED',
  WINNING_MELDED = 'WINNING_MELDED',
}

export interface BaseSet {
  tiles: PlayableTile[];
  concealedType: SetConcealedType;
}

export interface PairSet extends BaseSet {
  type: SetType.PAIR;
}

export interface PungSet extends BaseSet {
  type: SetType.PUNG;
}

export interface KongSet extends BaseSet {
  type: SetType.KONG;
}

export interface ChowSet extends BaseSet {
  type: SetType.CHOW;
  tiles: SuitedTile[];
}

export interface KnittedChowSet extends BaseSet {
  type: SetType.KNITTED_CHOW;
  tiles: SuitedTile[];
}

export type Set = PairSet | PungSet | KongSet | ChowSet | KnittedChowSet;

export type ConcealedSet<S extends Set = Set> = S & {
  concealedType: SetConcealedType.CONCEALED;
};

export type MeldedSet<S extends Set = Set> = S & {
  concealedType: SetConcealedType.MELDED | SetConcealedType.WINNING_MELDED;
};

export type DeclaredSet = ConcealedSet<KongSet> | MeldedSet;

export interface HandFan {
  type: FanType.HAND;
  fan: FanKind;
}

export interface SetsFan {
  type: FanType.SETS;
  fan: FanKind;
  sets: Set[];
}

export interface SpecialFan {
  type: FanType.SPECIAL;
  fan: FanKind;
  tile: Tile | null;
}

export type Fan = HandFan | SetsFan | SpecialFan;

export interface HandMahjong {
  hand: PlayableTile[];
  declaredSets: DeclaredSet[];
  winningTile: PlayableTile;
  fans: Fan[];
  sets: Set[] | null;
  waits: PlayableTile[];
  score: number;
}

export type GameResult = void;

export interface PlayerSettings extends BasePlayerSettings {
  autoPass: boolean;
  autoReplaceFlowers: boolean;
  sortHand: boolean;
  showLosingHand: boolean;
  showCurrentTile: boolean;
  showTileHints: boolean;
  highlightSameTile: boolean;
}

export interface ChangeTileIndexEvent {
  from: number;
  to: number;
}

export interface ClientEventMap extends CommonClientEventMap<GameType.MAHJONG> {
  [GameClientEventType.DISCARD_TILE]: number;
  [GameClientEventType.DECLARE]: DeclareDecision;
  [GameClientEventType.CHANGE_TILE_INDEX]: ChangeTileIndexEvent;
  [GameClientEventType.READY_FOR_NEW_HAND]: boolean;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.MAHJONG> {}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.MAHJONG]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: GameOptions;
      info: Game;
      result: GameResult;
      playerSettings: PlayerSettings;
    };
  }
}
