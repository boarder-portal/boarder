import { IGamePlayer as ICommonPlayer } from 'common/types';
import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { EGame, ICommonEventMap } from 'common/types/game';

export enum EGameEvent {
  GAME_INFO = 'GAME_INFO',
  GET_GAME_INFO = 'GET_GAME_INFO',
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

export interface IPlayer extends ICommonPlayer {
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

export interface IGameInfoEvent {
  options: IGameOptions;
  cards: ICard[];
  openedCardsIndexes: number[];
  players: IPlayer[];
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

export interface IEventMap extends ICommonEventMap<EGame.PEXESO> {
  [EGameEvent.GET_GAME_INFO]: undefined;
  [EGameEvent.OPEN_CARD]: number;

  [EGameEvent.GAME_INFO]: IGame;
  [EGameEvent.UPDATE_PLAYERS]: IUpdatePlayersEvent;
  [EGameEvent.HIDE_CARDS]: IHideCardsEvent;
  [EGameEvent.REMOVE_CARDS]: IRemoveCardsEvent;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.PEXESO]: {
      eventMap: IEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
