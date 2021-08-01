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

export interface ICarcassonneCardCity {
  type: ECarcassonneCardObject.CITY;
  sides: number[];
  shields?: number;
}

export interface ICarcassonneCardField {
  type: ECarcassonneCardObject.FIELD;
  sides: number[];
  cities?: number[];
}

export interface ICarcassonneCardRoad {
  type: ECarcassonneCardObject.ROAD;
  sides: number[];
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
