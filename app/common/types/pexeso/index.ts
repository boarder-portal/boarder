import { IPlayer } from 'common/types';
import { ICommonGameOptions } from 'common/types/room';

export enum EPexesoGameEvent {
  GAME_INFO = 'GAME_INFO',
  GET_GAME_INFO = 'GET_GAME_INFO',
  OPEN_CARD = 'OPEN_CARD',
  HIDE_CARDS = 'HIDE_CARDS',
  REMOVE_CARDS = 'REMOVE_CARDS',
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',
}

export enum EPexesoSet {
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

export enum EPexesoFieldLayout {
  RECT = 'RECT',
  HEX = 'HEX',
  SPIRAL = 'SPIRAL',
  SPIRAL_ROTATE = 'SPIRAL_ROTATE',
}

export enum EPexesoShuffleType {
  RANDOM = 'RANDOM',
  TURNED = 'TURNED',
}

export type TPexesoShuffleOptions = null | {
  type: EPexesoShuffleType.RANDOM;
  afterMovesCount: number;
  cardsCount: number;
} | {
  type: EPexesoShuffleType.TURNED;
  afterMovesCount: number;
};

export interface IPexesoGameOptions extends ICommonGameOptions {
  set: EPexesoSet;
  matchingCardsCount: number;
  differentCardsCount: number;
  pickRandomImages: boolean;
  useImageVariants: boolean;
  layout: EPexesoFieldLayout;
  shuffleOptions: TPexesoShuffleOptions;
}

export interface IPexesoPlayer extends IPlayer {
  isActive: boolean;
  score: number;
}

export interface IPexesoCard {
  imageId: number;
  imageVariant: number;
  isInGame: boolean;
}

export interface IPexesoGameInfoEvent {
  options: IPexesoGameOptions;
  cards: IPexesoCard[];
  openedCardsIndexes: number[];
  players: IPexesoPlayer[];
}

export interface IPexesoShuffleCardsIndexes {
  indexes: number[];
  permutation: number[];
}

export interface IPexesoHideCardsEvent {
  indexes: number[];
  shuffleIndexes: IPexesoShuffleCardsIndexes | null;
}

export interface IPexesoRemoveCardsEvent {
  indexes: number[];
  shuffleIndexes: IPexesoShuffleCardsIndexes | null;
}
