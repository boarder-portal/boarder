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
  HEAL = 'HEAL',
}

export enum EGameServerEvent {
  SYNC_COORDS = 'SYNC_COORDS',
  PLACE_BOMB = 'PLACE_BOMB',
  BOMBS_EXPLODED = 'BOMBS_EXPLODED',
  WALL_CREATED = 'WALL_CREATED',
  BONUS_CONSUMED = 'BONUS_CONSUMED',
  PLAYER_HEALED = 'PLAYER_HEALED',
}

export interface IGameOptions extends ICommonGameOptions {
  mapType: EMap | null;
}

export enum EDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum ELine {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}

export enum EPlayerColor {
  BLUE = 'BLUE',
  ORANGE = 'ORANGE',
  PINK = 'PINK',
  INDIGO = 'INDIGO',
}

export interface IPlayerData {
  color: EPlayerColor;
  coords: ICoords;
  direction: EDirection;
  startMovingTimestamp: number | null;
  speed: number;
  maxBombCount: number;
  bombRange: number;
  hp: number;
  hpReserve: number;
  invincibilityEndsAt: number | null;
}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
}

export interface IGameResult {
  winner: number | null;
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
  range: number;
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

export enum EMap {
  CHESS = 'CHESS',
  HALL = 'HALL',
  BUG = 'BUG',
  BUNKER = 'BUNKER',
  BUTTERFLY = 'BUTTERFLY',
  CABINET = 'CABINET',
  RACE = 'RACE',
}

export interface IGame {
  players: IPlayer[];
  map: TMap;
}

export interface ISyncCoordsEvent {
  playerIndex: number;
  direction: EDirection;
  startMovingTimestamp: number | null;
  coords: ICoords;
}

export interface IPlaceBombEvent {
  coords: ICoords;
  bomb: IBomb;
}

export interface IExplodedBox {
  coords: ICoords;
  bonus: IBonus | null;
}

export interface IExplodedBomb {
  coords: ICoords;
  explodedDirections: TExplodedDirections;
}

export interface IExplodedDirection {
  start: ICoords;
  end: ICoords;
}

export type TExplodedDirections = Record<ELine, IExplodedDirection>;

export interface IBombsExplodedEvent {
  bombs: IExplodedBomb[];
  hitPlayers: number[];
  explodedBoxes: IExplodedBox[];
  invincibilityEndsAt: number;
}

export interface IWallCreatedEvent {
  coords: ICoords;
  wall: IWall;
  deadPlayers: number[];
}

export interface IBonusConsumedEvent {
  coords: ICoords;
  playerIndex: number;
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.BOMBERS> {
  [EGameClientEvent.START_MOVING]: EDirection;
  [EGameClientEvent.STOP_MOVING]: undefined;
  [EGameClientEvent.PLACE_BOMB]: undefined;
  [EGameClientEvent.HEAL]: undefined;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.BOMBERS> {
  [EGameServerEvent.SYNC_COORDS]: ISyncCoordsEvent;
  [EGameServerEvent.PLACE_BOMB]: IPlaceBombEvent;
  [EGameServerEvent.BOMBS_EXPLODED]: IBombsExplodedEvent;
  [EGameServerEvent.WALL_CREATED]: IWallCreatedEvent;
  [EGameServerEvent.BONUS_CONSUMED]: IBonusConsumedEvent;
  [EGameServerEvent.PLAYER_HEALED]: number;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.BOMBERS]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
      result: IGameResult;
    };
  }
}
