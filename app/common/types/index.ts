import { EGame, IGameData, TGameInfo } from 'common/types/game';

export interface IUser {
  login: string;
}

export interface IDBUser extends IUser {
  password: string;
}

export enum EPlayerStatus {
  READY = 'READY',
  NOT_READY = 'NOT_READY',
  PLAYING = 'PLAYING',
  DISCONNECTED = 'DISCONNECTED',
}

export interface IGamePlayer extends IUser {
  status: EPlayerStatus;
  index: number;
}

export interface ICoords {
  x: number;
  y: number;
}

export interface IGameOptions {
  playersCount: number;
}

export enum ECommonGameEvent {
  TOGGLE_READY = '$$TOGGLE_READY',
  UPDATE_PLAYERS = '$$UPDATE_PLAYERS',
  GET_DATA = '$$GET_DATA',
  GET_INFO = '$$GET_INFO',
  END = '$$END',
}

export interface ICommonEventMap<Game extends EGame> {
  [ECommonGameEvent.TOGGLE_READY]: undefined;

  [ECommonGameEvent.GET_DATA]: IGameData<Game>;
  [ECommonGameEvent.GET_INFO]: TGameInfo<Game>;
  [ECommonGameEvent.UPDATE_PLAYERS]: IGamePlayer[];
  [ECommonGameEvent.END]: undefined;
}
