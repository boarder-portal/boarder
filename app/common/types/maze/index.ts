import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { ICoords } from 'common/types/game';

export enum EMazeGameEvent {
  // client events
  GET_GAME_INFO = 'GET_GAME_INFO',

  // server events
  GAME_INFO = 'GAME_INFO',
}

export interface IMazeGameOptions extends ICommonGameOptions {

}

export interface IMazePlayer extends IPlayer {
  side: 'top' | 'bottom';
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
}
