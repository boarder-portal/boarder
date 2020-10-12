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

export interface IPexesoGameOptions extends ICommonGameOptions {
  set: EPexesoSet;
  matchingCardsCount: number;
  differentCardsCount: number;
  pickRandomImages: boolean;
  useImageVariants: boolean;
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
