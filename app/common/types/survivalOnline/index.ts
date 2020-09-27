import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';

export enum ESurvivalOnlineGameEvent {
  GAME_INFO = 'GAME_INFO',
  GET_GAME_INFO = 'GET_GAME_INFO',
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',
  UPDATE_CELLS = 'UPDATE_CELLS',
}

export interface ISurvivalOnlineGameOptions extends ICommonGameOptions {

}

export interface ISurvivalOnlinePlayer extends IPlayer {
  x: number;
  y: number;
  hp: number;
}

export enum ESurvivalOnlineBiome {
  GRASS = 'GRASS',
}

export enum ESurvivalOnlineObject {
  BASE = 'BASE',
  PLAYER = 'PLAYER',
  ZOMBIE = 'ZOMBIE',
  TREE = 'TREE',
}

export enum ESurvivalOnlineDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface ISurvivalOnlineObject {
  type: ESurvivalOnlineObject;
}

export interface ISurvivalOnlineBaseObject extends ISurvivalOnlineObject {
  type: ESurvivalOnlineObject.BASE;
  hp: number;
}

export interface ISurvivalOnlinePlayerObject extends ISurvivalOnlineObject {
  type: ESurvivalOnlineObject.PLAYER;
  player: ISurvivalOnlinePlayer;
  direction: ESurvivalOnlineDirection;
}

export interface ISurvivalOnlineZombieObject extends ISurvivalOnlineObject {
  type: ESurvivalOnlineObject.ZOMBIE;
  hp: number;
  direction: ESurvivalOnlineDirection;
}

export interface ISurvivalOnlineTreeObject extends ISurvivalOnlineObject {
  type: ESurvivalOnlineObject.TREE;
  hp: number;
}

export type TSurvivalOnlineObject = (
  ISurvivalOnlineBaseObject
  | ISurvivalOnlinePlayerObject
  | ISurvivalOnlineZombieObject
  | ISurvivalOnlineTreeObject
);

export interface ISurvivalOnlineCell<Obj extends TSurvivalOnlineObject = TSurvivalOnlineObject> {
  x: number;
  y: number;
  biome: ESurvivalOnlineBiome;
  object: Obj | null;
}

export interface ISurvivalOnlineCellWithObject<Obj extends TSurvivalOnlineObject> extends ISurvivalOnlineCell<Obj> {
  object: Obj;
}

export type TSurvivalOnlineMap = ISurvivalOnlineCell<TSurvivalOnlineObject>[][];

export interface ISurvivalOnlineGameInfoEvent {
  map: TSurvivalOnlineMap;
  players: ISurvivalOnlinePlayer[];
}

