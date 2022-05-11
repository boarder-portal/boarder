import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IPlayer as ICommonPlayer } from 'common/types';
import { IGameInfoEvent, ISendSetEvent } from 'common/types/set/events';
import { EGame } from 'common/types/game';

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

export interface IEventMap {
  [EGameEvent.GET_GAME_INFO]: undefined;
  [EGameEvent.SEND_SET]: ISendSetEvent;
  [EGameEvent.SEND_NO_SET]: undefined;

  [EGameEvent.GAME_INFO]: IGameInfoEvent;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.SET]: {
      event: EGameEvent;
      eventMap: IEventMap;
      options: IGameOptions;
      player: IPlayer;
    };
  }
}
