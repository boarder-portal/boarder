import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { ICoords } from 'common/types/game';

export enum EMazeGameEvent {
  // client events
  GET_GAME_INFO = 'GET_GAME_INFO',
  MOVE_PLAYER = 'MOVE_PLAYER',
  STOP_PLAYER = 'STOP_PLAYER',

  // server events
  GAME_INFO = 'GAME_INFO',
  PLAYER_MOVED = 'PLAYER_MOVED',
  PLAYER_STOPPED = 'PLAYER_STOPPED',
}

export interface IMazeGameOptions extends ICommonGameOptions {

}

export enum EMazeMoveEvent {
  MOVE = 'MOVE',
  STOP = 'STOP',
}

export interface IMazeMoveMoveEvent {
  type: EMazeMoveEvent.MOVE;
  directionAngle: number;
  timestamp: number;
}

export interface IMazeMoveStopEvent {
  type: EMazeMoveEvent.STOP;
  timestamp: number;
}

export type TMazeMoveEvent = IMazeMoveMoveEvent | IMazeMoveStopEvent;

export enum EMazePlayerSide {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
}

export interface IMazePlayer extends IPlayer {
  side: EMazePlayerSide;
  x: number;
  y: number;
  directionAngle: number;
  isMoving: boolean;
  moveEventsQueue: TMazeMoveEvent[];
  lastActionTimestamp: number;
}

export enum ESide {
  TOP = 'TOP',
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
  LEFT = 'LEFT',
}

export interface IMazeWall {
  from: ICoords;
  to: ICoords;
}

export interface IMazeGameInfo {
  walls: IMazeWall[];
  players: IMazePlayer[];
}

export interface IMazePlayerMoveEvent {
  login: string;
  x: number;
  y: number;
}
