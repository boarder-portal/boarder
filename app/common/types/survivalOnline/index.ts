import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
  IPlayerSettings as ICommonPlayerSettings,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {
  MOVE_PLAYER = 'MOVE_PLAYER',
}

export enum EGameServerEvent {
  UPDATE_GAME = 'UPDATE_GAME',
}

export interface IGameOptions extends ICommonGameOptions {}

export interface IPlayerData {
  cell: ICellWithObject<IPlayerObject>;
}

export interface IPlayer extends IGamePlayer<EGame.SURVIVAL_ONLINE> {
  data: IPlayerData;
}

export enum EBiome {
  GRASS = 'GRASS',
}

export enum EObject {
  BASE = 'BASE',
  PLAYER = 'PLAYER',
  ZOMBIE = 'ZOMBIE',
  TREE = 'TREE',
}

export enum EDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface IObject {
  type: EObject;
}

export interface IBaseObject extends IObject {
  type: EObject.BASE;
}

export interface IPlayerObject extends IObject {
  type: EObject.PLAYER;
  index: number;
  direction: EDirection;
}

export interface IZombieObject extends IObject {
  type: EObject.ZOMBIE;
  direction: EDirection;
}

export interface ITreeObject extends IObject {
  type: EObject.TREE;
}

export type TObject = IBaseObject | IPlayerObject | IZombieObject | ITreeObject;

export interface ICell<Obj extends TObject = TObject> {
  x: number;
  y: number;
  biome: EBiome;
  object: Obj | null;
}

export interface ICellWithObject<Obj extends TObject = TObject> extends ICell<Obj> {
  object: Obj;
}

export type TMap = ICell[][];

export interface IGameInfoEvent {
  map: TMap;
  players: IPlayer[];
}

export interface IGame {
  map: TMap;
  players: IPlayer[];
}

export interface IUpdateGameEvent {
  players: IPlayer[] | null;
  cells: ICell[];
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.SURVIVAL_ONLINE> {
  [EGameClientEvent.MOVE_PLAYER]: EDirection;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.SURVIVAL_ONLINE> {
  [EGameServerEvent.UPDATE_GAME]: IUpdateGameEvent;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.SURVIVAL_ONLINE]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
      result: void;
      playerSettings: ICommonPlayerSettings;
    };
  }
}
