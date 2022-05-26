import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  ICoords,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {
  START_MOVING = 'START_MOVING',
  STOP_MOVING = 'STOP_MOVING',
  PLACE_BOMB = 'PLACE_BOMB',
}

export enum EGameServerEvent {
  START_MOVING = 'START_MOVING',
  STOP_MOVING = 'STOP_MOVING',
  PLACE_BOMB = 'PLACE_BOMB',
  BOMBS_EXPLODED = 'BOMBS_EXPLODED',
  WALL_CREATED = 'WALL_CREATED',
  BONUS_CONSUMED = 'BONUS_CONSUMED',
}

export interface IGameOptions extends ICommonGameOptions {}

export enum EDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface IPlayerData {
  coords: ICoords;
  direction: EDirection;
  isMoving: boolean;
  speed: number;
  maxBombCount: number;
  bombRange: number;
  hp: number;
}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
}

export enum EObject {
  BOX = 'BOX',
  WALL = 'WALL',
  BOMB = 'BOMB',
  BONUS = 'BONUS',
}

export enum EBonus {
  SPEED = 'SPEED',
  BOMB_COUNT = 'BOMB_COUNT',
  BOMB_RANGE = 'BOMB_RANGE',
  HP = 'HP',
}

export interface IBox {
  type: EObject.BOX;
}

export interface IWall {
  type: EObject.WALL;
}

export interface IBomb {
  type: EObject.BOMB;
  explodesAt: number;
}

export interface IBonus {
  type: EObject.BONUS;
  bonusType: EBonus;
}

export type TMapObject = IBox | IWall | IBomb | IBonus;

export interface ICell {
  x: number;
  y: number;
  object: TMapObject | null;
}

export type TMap = ICell[][];

export interface IGame {
  players: IPlayer[];
  map: TMap;
}

export interface IStartMovingEvent {
  playerIndex: number;
  direction: EDirection;
}

export interface IStopMovingEvent {
  playerIndex: number;
}

export interface IPlaceBombEvent {
  coords: ICoords;
}

export interface IExplodedBox {
  coords: ICoords;
  bonus: IBonus | null;
}

export interface IBombsExplodedEvent {
  bombsCoords: ICoords[];
  hitPlayers: number[];
  explodedBoxes: IExplodedBox[];
  invincibilityEndsAt: number;
}

export interface IWallCreatedEvent {
  coords: ICoords;
}

export interface IBonusConsumedEvent {
  coords: ICoords;
  playedIndex: number;
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.BOMBERS> {
  [EGameClientEvent.START_MOVING]: EDirection;
  [EGameClientEvent.STOP_MOVING]: undefined;
  [EGameClientEvent.PLACE_BOMB]: undefined;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.BOMBERS> {
  [EGameServerEvent.START_MOVING]: IStartMovingEvent;
  [EGameServerEvent.STOP_MOVING]: IStopMovingEvent;
  [EGameServerEvent.PLACE_BOMB]: IPlaceBombEvent;
  [EGameServerEvent.BOMBS_EXPLODED]: IBombsExplodedEvent;
  [EGameServerEvent.WALL_CREATED]: IWallCreatedEvent;
  [EGameServerEvent.BONUS_CONSUMED]: IBonusConsumedEvent;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.BOMBERS]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
