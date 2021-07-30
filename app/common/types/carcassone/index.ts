import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';

export enum ECarcassoneGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',

  GAME_INFO = 'GAME_INFO',
}

export enum ECarcassoneCardObject {
  CITY = 'CITY',
  ROAD = 'ROAD',
  FIELD = 'FIELD',
  MONASTERY = 'MONASTERY',
}

export interface ICarcassoneCardCity {
  type: ECarcassoneCardObject.CITY;
  sides: number[];
  shields?: number;
}

export interface ICarcassoneCardField {
  type: ECarcassoneCardObject.FIELD;
  sides: number[];
  cities?: number[];
}

export interface ICarcassoneCardRoad {
  type: ECarcassoneCardObject.ROAD;
  sides: number[];
}

export type TCarcassoneCardObject = ICarcassoneCardCity | ICarcassoneCardField | ICarcassoneCardRoad;

export interface ICarcassoneCard {
  id: number;
  count: number;
  objects: TCarcassoneCardObject[];
}

export interface ICarcassoneTile {
  x: number;
  y: number;
  card: ICarcassoneCard | null;
}

export interface ICarcassoneGameOptions extends ICommonGameOptions {

}

export interface ICarcassonePlayer extends IPlayer {
  isActive: boolean;
  score: number;
}

export interface ICarcassoneGameInfoEvent {
  players: ICarcassonePlayer[];
  board: ICarcassoneTile[][];
}
