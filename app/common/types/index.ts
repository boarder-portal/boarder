import { EGame, IGameData, TGameInfo, TGameResult, TPlayerSettings } from 'common/types/game';

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

export interface IGamePlayer<Game extends EGame> extends IUser {
  name: string;
  status: EPlayerStatus;
  index: number;
  isBot: boolean;
  settings: TPlayerSettings<Game>;
}

export interface ICoords {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IGameOptions {
  minPlayersCount: number;
  maxPlayersCount: number;
  useBots?: boolean;
}

export interface IPlayerSettings {}

export enum ECommonGameClientEvent {
  TOGGLE_READY = '$$TOGGLE_READY',
  CHANGE_SETTING = '$$CHANGE_SETTING',
}

export enum ECommonGameServerEvent {
  UPDATE_PLAYERS = '$$UPDATE_PLAYERS',
  GET_DATA = '$$GET_DATA',
  GET_INFO = '$$GET_INFO',
  PING = '$$PING',
  END = '$$END',
}

export type TChangeSettingEvent<Game extends EGame> = {
  [K in keyof TPlayerSettings<Game>]: {
    key: K;
    value: TPlayerSettings<Game>[K];
  };
}[keyof TPlayerSettings<Game>];

export interface ICommonClientEventMap<Game extends EGame> {
  [ECommonGameClientEvent.TOGGLE_READY]: undefined;
  [ECommonGameClientEvent.CHANGE_SETTING]: TChangeSettingEvent<Game>;
}

export interface ICommonServerEventMap<Game extends EGame> {
  [ECommonGameServerEvent.GET_DATA]: IGameData<Game>;
  [ECommonGameServerEvent.GET_INFO]: TGameInfo<Game>;
  [ECommonGameServerEvent.UPDATE_PLAYERS]: IGamePlayer<Game>[];
  [ECommonGameServerEvent.PING]: number;
  [ECommonGameServerEvent.END]: TGameResult<Game>;
}
