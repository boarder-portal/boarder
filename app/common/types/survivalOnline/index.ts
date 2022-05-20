import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IGamePlayer as ICommonPlayer } from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  MOVE_PLAYER = 'MOVE_PLAYER',

  GAME_INFO = 'GAME_INFO',
  UPDATE_GAME = 'UPDATE_GAME',
}

export interface IGameOptions extends ICommonGameOptions {}

export interface IPlayerData {
  cell: ICellWithObject<IPlayerObject>;
}

export interface IPlayer extends ICommonPlayer {
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

export interface IEventMap {
  [EGameEvent.GET_GAME_INFO]: undefined;
  [EGameEvent.MOVE_PLAYER]: EDirection;

  [EGameEvent.GAME_INFO]: IGameInfoEvent;
  [EGameEvent.UPDATE_GAME]: IUpdateGameEvent;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.SURVIVAL_ONLINE]: {
      eventMap: IEventMap;
      options: IGameOptions;
      player: ICommonPlayer;
    };
  }
}
