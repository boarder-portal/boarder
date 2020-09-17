import { IPlayer } from 'common/types';

export enum EPexesoGameEvent {
  GAME_INFO = 'GAME_INFO',
  GET_GAME_INFO = 'GET_GAME_INFO',
  OPEN_CARD = 'OPEN_CARD',
  HIDE_CARDS = 'HIDE_CARDS',
  REMOVE_CARDS = 'REMOVE_CARDS',
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',
}

export interface IPexesoPlayer extends IPlayer {
  isActive: boolean;
  score: number;
}

export interface IPexesoCard {
  id: number;
  isInGame: boolean;
}

export interface IPexesoCardCoords {
  x: number;
  y: number;
}

export interface IPexesoGameInfoEvent {
  cards: IPexesoCard[][];
  openedCardsCoords: IPexesoCardCoords[];
  players: IPexesoPlayer[];
}
