import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';

export enum ESetGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  SEND_SET = 'SEND_SET',
  SEND_NO_SET = 'SEND_NO_SET',

  GAME_INFO = 'GAME_INFO',
}

export interface ISetGameOptions extends ICommonGameOptions {

}

export interface ISetPlayer extends IPlayer {
  score: number;
}

export enum ESetCardColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
}

export enum ESetCardFill {
  EMPTY = 'empty',
  STRIPED = 'striped',
  FILLED = 'filled',
}

export enum ESetCardShape {
  WAVE = 'wave',
  OVAL = 'oval',
  RHOMBUS = 'rhombus',
}

export interface ISetCard {
  id: number;
  count: number;
  color: ESetCardColor;
  fill: ESetCardFill;
  shape: ESetCardShape;
}
