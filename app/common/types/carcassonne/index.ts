import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { ICoords, IGamePlayer as ICommonPlayer } from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  ATTACH_CARD = 'ATTACH_CARD',

  GAME_INFO = 'GAME_INFO',
}

export enum ECardObject {
  CITY = 'CITY',
  ROAD = 'ROAD',
  FIELD = 'FIELD',
  MONASTERY = 'MONASTERY',
}

export enum ECityGoods {
  WHEAT = 'WHEAT',
  FABRIC = 'FABRIC',
  WINE = 'WINE',
}

export enum EMeepleType {
  COMMON = 'COMMON',
  FAT = 'FAT',
  BUILDER = 'BUILDER',
  PIG = 'PIG',
}

export enum EPlayerColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  BLACK = 'BLACK',
  YELLOW = 'YELLOW',
}

export interface ICardObject {
  type: ECardObject;
  meepleCoords: ICoords;
}

export interface ICardCity extends ICardObject {
  type: ECardObject.CITY;
  sideParts: number[];
  shields?: number;
  cathedral?: true;
  goods?: ECityGoods;
}

export interface ICardField extends ICardObject {
  type: ECardObject.FIELD;
  sideParts: number[];
  cities?: number[];
}

export interface ICardRoad extends ICardObject {
  type: ECardObject.ROAD;
  sideParts: number[];
  inn?: true;
}

export interface ICardMonastery extends ICardObject {
  type: ECardObject.MONASTERY;
}

export type TCardObject = ICardCity | ICardField | ICardRoad | ICardMonastery;

export interface ICard {
  id: number;
  count: number;
  objects: TCardObject[];
}

export interface IPlayerMeeple {
  playerIndex: number;
  type: EMeepleType;
}

export interface IGameObject {
  id: number;
  type: ECardObject;
  cards: ICoords[];
  meeples: IPlayerMeeple[];
}

export interface IGameCity extends IGameObject {
  type: ECardObject.CITY;
  shields: number;
  cathedral: boolean;
  goods: Partial<Record<ECityGoods, number>>;
  isFinished: boolean;
}

export interface IGameField extends IGameObject {
  type: ECardObject.FIELD;
  cities: number[];
}

export interface IGameRoad extends IGameObject {
  type: ECardObject.ROAD;
  inn: boolean;
  isFinished: boolean;
}

export interface IGameMonastery extends IGameObject {
  type: ECardObject.MONASTERY;
}

export type TGameObject = IGameCity | IGameField | IGameRoad | IGameMonastery;

export type TObjects = Partial<Record<number, TGameObject>>;

export interface IGameCard extends ICoords {
  id: number;
  rotation: number;
  objectsBySideParts: number[];
  monasteryId: number | null;
  meeple: IGamePlacedMeeple | null;
}

export type TBoard = Partial<Record<number, Partial<Record<number, IGameCard>>>>;

export interface IGameOptions extends ICommonGameOptions {}

export interface IObjectScore {
  objectId: number;
  score: number;
}

export interface IGoodsScore {
  goods: ECityGoods;
  score: number;
}

export type TScore = IObjectScore | IGoodsScore;

export interface IPlayer extends ICommonPlayer {
  color: EPlayerColor;
  score: TScore[];
  cards: ICard[];
  meeples: Record<EMeepleType, number>;
  goods: Record<ECityGoods, number>;
  lastMoves: ICoords[];
}

export interface IPlacedMeeple {
  type: EMeepleType;
  cardObjectId: number;
}

export interface IGamePlacedMeeple extends IPlacedMeeple {
  color: EPlayerColor;
  gameObjectId: number;
}

export interface IGame {
  players: IPlayer[];
  activePlayerIndex: number;
  board: TBoard;
  objects: TObjects;
  cardsLeft: number;
  turn: ITurn | null;
}

export interface ITurn {
  endsAt: number;
}

export interface IAttachCardEvent {
  cardIndex: number;
  coords: ICoords;
  rotation: number;
  meeple: IPlacedMeeple | null;
}

export interface IEventMap {
  [EGameEvent.GET_GAME_INFO]: undefined;
  [EGameEvent.ATTACH_CARD]: IAttachCardEvent;

  [EGameEvent.GAME_INFO]: IGame;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.CARCASSONNE]: {
      event: EGameEvent;
      eventMap: IEventMap;
      options: IGameOptions;
      player: IPlayer;
    };
  }
}
