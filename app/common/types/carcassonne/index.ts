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

export enum ECarcassonneMeepleType {
  COMMON = 'COMMON',
  FAT = 'FAT',
  BUILDER = 'BUILDER',
  PIG = 'PIG',
}

export enum ECarcassonnePlayerColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  BLACK = 'BLACK',
  YELLOW = 'YELLOW',
  GREY = 'GREY',
}

export interface ICarcassonneCardObject {
  type: ECarcassonneCardObject;
  meepleCoords: ICoords;
}

export interface ICarcassonneCardCity extends ICarcassonneCardObject {
  type: ECarcassonneCardObject.CITY;
  sideParts: number[];
  shields?: number;
  cathedral?: true;
  goods?: ECarcassonneCityGoods;
}

export interface ICarcassonneCardField extends ICarcassonneCardObject {
  type: ECarcassonneCardObject.FIELD;
  sideParts: number[];
  cities?: number[];
}

export interface ICarcassonneCardRoad extends ICarcassonneCardObject {
  type: ECarcassonneCardObject.ROAD;
  sideParts: number[];
  inn?: true;
}

export interface ICarcassonneCardMonastery extends ICarcassonneCardObject {
  type: ECarcassonneCardObject.MONASTERY;
}

export type TCarcassonneCardObject = ICarcassonneCardCity | ICarcassonneCardField | ICarcassonneCardRoad | ICarcassonneCardMonastery;

export interface ICarcassonneCard {
  id: number;
  count: number;
  objects: TCarcassonneCardObject[];
}

export interface ICarcassonneGameObject {
  id: number;
  type: ECarcassonneCardObject;
  cards: ICoords[];
  meeples: Partial<Record<string, Partial<Record<ECarcassonneMeepleType, number>>>>;
}

export interface ICarcassonneGameCity extends ICarcassonneGameObject {
  type: ECarcassonneCardObject.CITY;
  shields: number;
  cathedral: boolean;
  goods: Partial<Record<ECarcassonneCityGoods, number>>;
  isFinished: boolean;
}

export interface ICarcassonneGameField extends ICarcassonneGameObject {
  type: ECarcassonneCardObject.FIELD;
  cities: number[];
}

export interface ICarcassonneGameRoad extends ICarcassonneGameObject {
  type: ECarcassonneCardObject.ROAD;
  inn: boolean;
  isFinished: boolean;
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
  monasteryId: number | null;
  meeple: IGamePlacedMeeple | null;
}

export type TCarcassonneBoard = Partial<Record<number, Partial<Record<number, ICarcassonneGameCard>>>>;

export interface ICarcassonneGameOptions extends ICommonGameOptions {

}

export interface ICarcassonneObjectScore {
  objectId: number;
  score: number;
}

export interface ICarcassonnePlayer extends IPlayer {
  color: ECarcassonnePlayerColor;
  isActive: boolean;
  score: ICarcassonneObjectScore[];
  cards: ICarcassonneCard[];
  meeples: Record<ECarcassonneMeepleType, number>;
}

export interface IPlacedMeeple {
  type: ECarcassonneMeepleType;
  cardObjectId: number;
}

export interface IGamePlacedMeeple extends IPlacedMeeple {
  color: ECarcassonnePlayerColor;
  gameObjectId: number;
}

export interface ICarcassonneGameInfoEvent {
  players: ICarcassonnePlayer[];
  board: TCarcassonneBoard;
  objects: TCarcassonneObjects;
  cardsLeft: number;
}

export interface ICarcassonneAttachCardEvent {
  cardIndex: number;
  coords: ICoords;
  rotation: number;
  meeple: IPlacedMeeple | null;
}
