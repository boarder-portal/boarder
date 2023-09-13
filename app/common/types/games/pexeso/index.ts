import {
  BaseGameOptions,
  BaseGamePlayer,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  OPEN_CARD = 'OPEN_CARD',
}

export enum GameServerEventType {
  OPEN_CARD = 'OPEN_CARD',
  HIDE_CARDS = 'HIDE_CARDS',
  REMOVE_CARDS = 'REMOVE_CARDS',
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',
}

export enum SetType {
  COMMON = 'common',
  FRIENDS = 'friends',
  GAME_OF_THRONES = 'gameOfThrones',
  HARRY_POTTER = 'harryPotter',
  LOST = 'lost',
  PHILADELPHIA = 'philadelphia',
  PIRATES = 'pirates',
  POKER = 'poker',
  STAR_WARS = 'starWars',
  DST = 'dst',
  BUILDINGS = 'buildings',
  BREAKING_BAD = 'breakingBad',
}

export enum FieldLayoutType {
  RECT = 'RECT',
  HEX = 'HEX',
  SPIRAL = 'SPIRAL',
  SPIRAL_ROTATE = 'SPIRAL_ROTATE',
}

export enum ShuffleType {
  RANDOM = 'RANDOM',
  TURNED = 'TURNED',
}

export type ShuffleOptions =
  | null
  | {
      type: ShuffleType.RANDOM;
      afterMovesCount: number;
      cardsCount: number;
    }
  | {
      type: ShuffleType.TURNED;
      afterMovesCount: number;
    };

export interface GameOptions extends BaseGameOptions {
  set: SetType;
  matchingCardsCount: number;
  differentCardsCount: number;
  pickRandomImages: boolean;
  useImageVariants: boolean;
  layout: FieldLayoutType;
  shuffleOptions: ShuffleOptions;
}

export interface PlayerData {
  score: number;
}

export interface Player extends BaseGamePlayer<GameType.PEXESO> {
  data: PlayerData;
}

export interface Game {
  players: Player[];
  activePlayerIndex: number;
  cards: Card[];
  turn: Turn | null;
}

export interface Turn {
  openedCardsIndexes: number[];
}

export interface Card {
  imageId: number;
  imageVariant: number;
  isInGame: boolean;
}

export interface ShuffleCardsIndexes {
  indexes: number[];
  permutation: number[];
}

export type GameResult = number[];

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface UpdatePlayersEvent {
  players: Player[];
  activePlayerIndex: number;
}

export interface HideCardsEvent {
  indexes: number[];
  shuffleIndexes: ShuffleCardsIndexes | null;
}

export interface RemoveCardsEvent {
  indexes: number[];
  shuffleIndexes: ShuffleCardsIndexes | null;
}

export interface ClientEventMap extends CommonClientEventMap<GameType.PEXESO> {
  [GameClientEventType.OPEN_CARD]: number;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.PEXESO> {
  [GameServerEventType.OPEN_CARD]: number;
  [GameServerEventType.UPDATE_PLAYERS]: UpdatePlayersEvent;
  [GameServerEventType.HIDE_CARDS]: HideCardsEvent;
  [GameServerEventType.REMOVE_CARDS]: RemoveCardsEvent;
}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.PEXESO]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: GameOptions;
      info: Game;
      result: GameResult;
      playerSettings: PlayerSettings;
      testCaseType: TestCaseType;
      gameEventType: GameEventType;
    };
  }
}
