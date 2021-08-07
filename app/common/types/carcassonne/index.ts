import { ICommonGameOptions } from 'common/types/room';
import { ICoords, IPlayer } from 'common/types';

export enum ECarcassonneGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  ATTACH_CARD = 'ATTACH_CARD',

  GAME_INFO = 'GAME_INFO',
}

export enum ECarcassonneCardObject {
  CITY = 'CITY',
  ROAD = 'ROAD',
  FIELD = 'FIELD',
  MONASTERY = 'MONASTERY',
}

export enum ECarcassonneCityGoods {
  WHEAT = 'WHEAT',
  FABRIC = 'FABRIC',
  WINE = 'WINE',
}

export interface ICarcassonneCardCity {
  type: ECarcassonneCardObject.CITY;
  sideParts: number[];
  shields?: number;
  cathedral?: true;
  goods?: ECarcassonneCityGoods;
}

export interface ICarcassonneCardField {
  type: ECarcassonneCardObject.FIELD;
  sideParts: number[];
  cities?: number[];
}

export interface ICarcassonneCardRoad {
  type: ECarcassonneCardObject.ROAD;
  sideParts: number[];
  inn?: true;
}

export interface ICarcassonneCardMonastery {
  type: ECarcassonneCardObject.MONASTERY;
}

export type TCarcassonneCardObject = ICarcassonneCardCity | ICarcassonneCardField | ICarcassonneCardRoad | ICarcassonneCardMonastery;

export interface ICarcassonneCard {
  id: number;
  count: number;
  objects: TCarcassonneCardObject[];
}

export interface ICarcassonneObjectEnd {
  card: ICoords;
  sidePart: number;
}

export interface ICarcassonneGameObject {
  id: number;
  type: ECarcassonneCardObject;
  cards: ICoords[];
}

export interface ICarcassonneGameCity extends ICarcassonneGameObject {
  type: ECarcassonneCardObject.CITY;
  shields: number;
  cathedral: boolean;
  goods: Partial<Record<ECarcassonneCityGoods, number>>;
  ends: ICarcassonneObjectEnd[];
}

export interface ICarcassonneGameField extends ICarcassonneGameObject {
  type: ECarcassonneCardObject.FIELD;
  cities: number[];
}

export interface ICarcassonneGameRoad extends ICarcassonneGameObject {
  type: ECarcassonneCardObject.ROAD;
  inn: boolean;
  ends: ICarcassonneObjectEnd[];
}

export interface ICarcassonneGameMonastery extends ICarcassonneGameObject {
  type: ECarcassonneCardObject.MONASTERY;
}

export type TCarcassonneGameObject = ICarcassonneGameCity | ICarcassonneGameField | ICarcassonneGameRoad | ICarcassonneGameMonastery;

export type TCarcassonneObjects = Partial<Record<number, TCarcassonneGameObject>>;

export interface ICarcassonneGameCard extends ICoords {
  id: number;
  rotation: number;
  objectsBySideParts: number[];
}

export type TCarcassonneBoard = Partial<Record<number, Partial<Record<number, ICarcassonneGameCard>>>>;

export interface ICarcassonneGameOptions extends ICommonGameOptions {

}

export interface ICarcassonnePlayer extends IPlayer {
  isActive: boolean;
  score: number;
  cards: ICarcassonneCard[];
}

export interface ICarcassonneGameInfoEvent {
  players: ICarcassonnePlayer[];
  board: TCarcassonneBoard;
  objects: TCarcassonneObjects;
}

export interface ICarcassonneAttachCardEvent {
  card: ICarcassonneCard;
  coords: ICoords;
  rotation: number;
}
