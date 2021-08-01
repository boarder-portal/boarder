import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';

export enum ECarcassonneGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',

  GAME_INFO = 'GAME_INFO',
}

export enum ECarcassonneCardObject {
  CITY = 'CITY',
  ROAD = 'ROAD',
  FIELD = 'FIELD',
  MONASTERY = 'MONASTERY',
}

export type ECarcassonneCardSide = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface ICarcassonneCardCity {
  type: ECarcassonneCardObject.CITY;
  sides: ECarcassonneCardSide[];
  shields?: number;
}

export interface ICarcassonneCardField {
  type: ECarcassonneCardObject.FIELD;
  sides: ECarcassonneCardSide[];
  cities?: number[];
}

export interface ICarcassonneCardRoad {
  type: ECarcassonneCardObject.ROAD;
  sides: ECarcassonneCardSide[];
}

export type TCarcassonneCardObject = ICarcassonneCardCity | ICarcassonneCardField | ICarcassonneCardRoad;

export interface ICarcassonneCard {
  id: number;
  count: number;
  objects: TCarcassonneCardObject[];
}

export interface ICarcassonneTile {
  x: number;
  y: number;
  card: ICarcassonneCard | null;
}

export interface ICarcassonneGameOptions extends ICommonGameOptions {

}

export interface ICarcassonnePlayer extends IPlayer {
  isActive: boolean;
  score: number;
}

export interface ICarcassonneGameInfoEvent {
  players: ICarcassonnePlayer[];
  board: ICarcassonneTile[][];
}
