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
  ACTIVATE_BUFF = 'ACTIVATE_BUFF',
}

export enum EGameServerEvent {
  CAN_CONTROL = 'CAN_CONTROL',
  SYNC_COORDS = 'SYNC_COORDS',
  PLACE_BOMB = 'PLACE_BOMB',
  BOMBS_EXPLODED = 'BOMBS_EXPLODED',
  WALL_CREATED = 'WALL_CREATED',
  BONUS_CONSUMED = 'BONUS_CONSUMED',
  PLAYER_HEALED = 'PLAYER_HEALED',
  PLAYER_DIED = 'PLAYER_DIED',
  BUFF_ACTIVATED = 'BUFF_ACTIVATED',
  BUFF_DEACTIVATED = 'BUFF_DEACTIVATED',
  WALLS_DESTROYED = 'WALLS_DESTROYED',
}

export interface IGameOptions extends ICommonGameOptions {
  mapType: EMap | null;
  withAbilities: boolean;
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
  DODGERBLUE = 'DODGERBLUE',
  ORANGE = 'ORANGE',
  RED = 'RED',
  MAGENTA = 'MAGENTA',
}

export interface IPlayerData {
  color: EPlayerColor;
  coords: ICoords;
  direction: EDirection;
  startMovingTimestamp: number | null;
  speed: number;
  speedReserve: number;
  maxBombCount: number;
  maxBombCountReserve: number;
  bombRange: number;
  bombRangeReserve: number;
  hp: number;
  hpReserve: number;
  buffs: IBuff[];
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

export enum EBuff {
  SUPER_SPEED = 'SUPER_SPEED',
  SUPER_BOMB = 'SUPER_BOMB',
  SUPER_RANGE = 'SUPER_RANGE',
  INVINCIBILITY = 'INVINCIBILITY',
  BOMB_INVINCIBILITY = 'BOMB_INVINCIBILITY',
}

export interface IBuff {
  type: EBuff;
  endsAt: number;
}

export interface IBox {
  type: EObject.BOX;
  id: number;
}

export interface IWall {
  type: EObject.WALL;
  id: number;
}

export interface IBomb {
  type: EObject.BOMB;
  id: number;
  range: number;
  isSuperBomb: boolean;
  isSuperRange: boolean;
  explodesAt: number;
}

export interface IBonus {
  type: EObject.BONUS;
  id: number;
  bonusType: EBonus;
}

export type TMapObject = IBox | IWall | IBomb | IBonus;

export interface ICell {
  x: number;
  y: number;
  objects: TMapObject[];
}

export type TMap = ICell[][];

export enum EMap {
  CHESS = 'CHESS',
  HALL = 'HALL',
  BUG = 'BUG',
  BUNKER = 'BUNKER',
  TURTLE = 'TURTLE',
  CABINET = 'CABINET',
  RACE = 'RACE',
  WAVE = 'WAVE',
  SIGHT = 'SIGHT',
  FIELD = 'FIELD',
  SUNFLOWER = 'SUNFLOWER',
  MEMBRANE = 'MEMBRANE',
  BUTTERFLY = 'BUTTERFLY',
  SIEGE = 'SIEGE',
  CRAB = 'CRAB',
}

export interface IGame {
  players: IPlayer[];
  map: TMap;
  mapType: EMap;
  startsAt: number;
  canControl: boolean;
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
  id: number;
  coords: ICoords;
  bonuses: IBonus[];
}

export interface IDestroyedWall {
  id: number;
  coords: ICoords;
}

export interface IExplodedBomb {
  id: number;
  coords: ICoords;
  explodedDirections: TExplodedDirections;
}

export interface IExplodedDirection {
  start: ICoords;
  end: ICoords;
}

export type TExplodedDirections = Record<ELine, IExplodedDirection>;

export interface IHitPlayer {
  index: number;
  damage: number;
}

export interface IBombsExplodedEvent {
  bombs: IExplodedBomb[];
  hitPlayers: IHitPlayer[];
  explodedBoxes: IExplodedBox[];
  destroyedWalls: IDestroyedWall[];
}

export interface IWallCreatedEvent {
  coords: ICoords;
  wall: IWall;
  deadPlayers: number[];
}

export interface IBonusConsumedEvent {
  id: number;
  coords: ICoords;
  playerIndex: number;
}

export interface IBuffActivatedEvent {
  playerIndex: number;
  buff: IBuff;
}

export interface IBuffDeactivatedEvent {
  playerIndex: number;
  type: EBuff;
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.BOMBERS> {
  [EGameClientEvent.START_MOVING]: EDirection;
  [EGameClientEvent.STOP_MOVING]: undefined;
  [EGameClientEvent.PLACE_BOMB]: undefined;
  [EGameClientEvent.HEAL]: undefined;
  [EGameClientEvent.ACTIVATE_BUFF]: EBuff;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.BOMBERS> {
  [EGameServerEvent.CAN_CONTROL]: undefined;
  [EGameServerEvent.SYNC_COORDS]: ISyncCoordsEvent;
  [EGameServerEvent.PLACE_BOMB]: IPlaceBombEvent;
  [EGameServerEvent.BOMBS_EXPLODED]: IBombsExplodedEvent;
  [EGameServerEvent.WALL_CREATED]: IWallCreatedEvent;
  [EGameServerEvent.BONUS_CONSUMED]: IBonusConsumedEvent;
  [EGameServerEvent.PLAYER_HEALED]: number;
  [EGameServerEvent.PLAYER_DIED]: number;
  [EGameServerEvent.BUFF_ACTIVATED]: IBuffActivatedEvent;
  [EGameServerEvent.BUFF_DEACTIVATED]: IBuffDeactivatedEvent;
  [EGameServerEvent.WALLS_DESTROYED]: IDestroyedWall[];
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
