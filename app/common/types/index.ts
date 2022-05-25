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
  name: string;
  status: EPlayerStatus;
  index: number;
  isBot: boolean;
}

export interface ICoords {
  x: number;
  y: number;
}

export interface IGameOptions {
  minPlayersCount: number;
  maxPlayersCount: number;
}

export enum ECommonGameClientEvent {
  TOGGLE_READY = '$$TOGGLE_READY',
}

export enum ECommonGameServerEvent {
  UPDATE_PLAYERS = '$$UPDATE_PLAYERS',
  GET_DATA = '$$GET_DATA',
  GET_INFO = '$$GET_INFO',
  END = '$$END',
}

export interface ICommonClientEventMap<Game extends EGame> {
  [ECommonGameClientEvent.TOGGLE_READY]: undefined;
}

export interface ICommonServerEventMap<Game extends EGame> {
  [ECommonGameServerEvent.GET_DATA]: IGameData<Game>;
  [ECommonGameServerEvent.GET_INFO]: TGameInfo<Game>;
  [ECommonGameServerEvent.UPDATE_PLAYERS]: IGamePlayer[];
  [ECommonGameServerEvent.END]: undefined;
}
