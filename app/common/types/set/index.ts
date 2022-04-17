import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IPlayer as ICommonPlayer } from 'common/types';

export enum EGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  SEND_SET = 'SEND_SET',
  SEND_NO_SET = 'SEND_NO_SET',

  GAME_INFO = 'GAME_INFO',
}

export interface IGameOptions extends ICommonGameOptions {

}

export interface IPlayer extends ICommonPlayer {
  score: number;
}

export enum ECardColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
}

export enum ECardFill {
  EMPTY = 'empty',
  STRIPED = 'striped',
  FILLED = 'filled',
}

export enum ECardShape {
  WAVE = 'wave',
  OVAL = 'oval',
  RHOMBUS = 'rhombus',
}

export interface ICard {
  id: number;
  count: number;
  color: ECardColor;
  fill: ECardFill;
  shape: ECardShape;
}
