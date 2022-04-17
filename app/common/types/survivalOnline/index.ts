import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IPlayer as ICommonPlayer } from 'common/types';

export enum EGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  MOVE_PLAYER = 'MOVE_PLAYER',

  GAME_INFO = 'GAME_INFO',
  UPDATE_GAME = 'UPDATE_GAME',
}

export interface IGameOptions extends ICommonGameOptions {

}

export interface IPlayer extends ICommonPlayer {
  x: number;
  y: number;
  object: IPlayerObject;
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
  hp: number;
}

export interface IPlayerObject extends IObject {
  type: EObject.PLAYER;
  login: string;
  hp: number;
  direction: EDirection;
  isMoving: boolean;
}

export interface IZombieObject extends IObject {
  type: EObject.ZOMBIE;
  hp: number;
  direction: EDirection;
}

export interface ITreeObject extends IObject {
  type: EObject.TREE;
  hp: number;
}

export type TObject = (
  | IBaseObject
  | IPlayerObject
  | IZombieObject
  | ITreeObject
);

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

export interface IUpdateGameEvent {
  players: IPlayer[] | null;
  cells: ICell[];
}

