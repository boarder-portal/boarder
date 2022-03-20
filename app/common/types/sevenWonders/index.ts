import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';

export enum ESevenWondersGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',

  GAME_INFO = 'GAME_INFO',
}

export interface ISevenWondersGameOptions extends ICommonGameOptions {

}

export interface ISevenWondersPlayer extends IPlayer {}

export interface ISevenWondersGameInfoEvent {
  players: ISevenWondersPlayer[];
}
