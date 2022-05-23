import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {
  OPEN_CARD = 'OPEN_CARD',
}

export enum EGameServerEvent {
  OPEN_CARD = 'OPEN_CARD',
  HIDE_CARDS = 'HIDE_CARDS',
  REMOVE_CARDS = 'REMOVE_CARDS',
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',
}

export enum ESet {
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

export enum EFieldLayout {
  RECT = 'RECT',
  HEX = 'HEX',
  SPIRAL = 'SPIRAL',
  SPIRAL_ROTATE = 'SPIRAL_ROTATE',
}

export enum EShuffleType {
  RANDOM = 'RANDOM',
  TURNED = 'TURNED',
}

export type TShuffleOptions =
  | null
  | {
      type: EShuffleType.RANDOM;
      afterMovesCount: number;
      cardsCount: number;
    }
  | {
      type: EShuffleType.TURNED;
      afterMovesCount: number;
    };

export interface IGameOptions extends ICommonGameOptions {
  set: ESet;
  matchingCardsCount: number;
  differentCardsCount: number;
  pickRandomImages: boolean;
  useImageVariants: boolean;
  layout: EFieldLayout;
  shuffleOptions: TShuffleOptions;
}

export interface IPlayerData {
  score: number;
}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
}

export interface IGame {
  players: IPlayer[];
  options: IGameOptions;
  activePlayerIndex: number;
  cards: ICard[];
  turn: ITurn | null;
}

export interface ITurn {
  openedCardsIndexes: number[];
}

export interface ICard {
  imageId: number;
  imageVariant: number;
  isInGame: boolean;
}

export interface IShuffleCardsIndexes {
  indexes: number[];
  permutation: number[];
}

export interface IUpdatePlayersEvent {
  players: IPlayer[];
  activePlayerIndex: number;
}

export interface IHideCardsEvent {
  indexes: number[];
  shuffleIndexes: IShuffleCardsIndexes | null;
}

export interface IRemoveCardsEvent {
  indexes: number[];
  shuffleIndexes: IShuffleCardsIndexes | null;
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.PEXESO> {
  [EGameClientEvent.OPEN_CARD]: number;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.PEXESO> {
  [EGameServerEvent.OPEN_CARD]: number;
  [EGameServerEvent.UPDATE_PLAYERS]: IUpdatePlayersEvent;
  [EGameServerEvent.HIDE_CARDS]: IHideCardsEvent;
  [EGameServerEvent.REMOVE_CARDS]: IRemoveCardsEvent;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.PEXESO]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
