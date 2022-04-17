import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { ICoords, IPlayer as ICommonPlayer } from 'common/types';

export enum EGameEvent {
  // client events
  GET_GAME_INFO = 'GET_GAME_INFO',
  MOVE_PLAYER = 'MOVE_PLAYER',
  STOP_PLAYER = 'STOP_PLAYER',

  // server events
  GAME_INFO = 'GAME_INFO',
  PLAYER_MOVED = 'PLAYER_MOVED',
  PLAYER_STOPPED = 'PLAYER_STOPPED',
}

export interface IGameOptions extends ICommonGameOptions {

}

export enum EMoveEvent {
  MOVE = 'MOVE',
  STOP = 'STOP',
}

export interface IMoveMoveEvent {
  type: EMoveEvent.MOVE;
  directionAngle: number;
  timestamp: number;
}

export interface IMoveStopEvent {
  type: EMoveEvent.STOP;
  timestamp: number;
}

export type TMoveEvent = IMoveMoveEvent | IMoveStopEvent;

export enum EPlayerSide {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
}

export interface IPlayer extends ICommonPlayer {
  side: EPlayerSide;
  x: number;
  y: number;
  directionAngle: number;
  isMoving: boolean;
  moveEventsQueue: TMoveEvent[];
  lastActionTimestamp: number;
}

export enum ESide {
  TOP = 'TOP',
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
  LEFT = 'LEFT',
}

export interface IWall {
  from: ICoords;
  to: ICoords;
}

export interface IGameInfo {
  walls: IWall[];
  players: IPlayer[];
}

export interface IPlayerMoveEvent {
  login: string;
  x: number;
  y: number;
}
