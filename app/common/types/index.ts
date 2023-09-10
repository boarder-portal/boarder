import { GameData, GameInfo, GameResult, GameType, PlayerSettings } from 'common/types/game';

export interface User {
  login: string;
}

export interface DBUser extends User {
  password: string;
}

export enum PlayerStatus {
  READY = 'READY',
  NOT_READY = 'NOT_READY',
  PLAYING = 'PLAYING',
  DISCONNECTED = 'DISCONNECTED',
}

export interface GamePlayer<Game extends GameType> extends User {
  name: string;
  status: PlayerStatus;
  index: number;
  isBot: boolean;
  settings: PlayerSettings<Game>;
}

export interface Coords {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseGameOptions {
  minPlayersCount: number;
  maxPlayersCount: number;
  useBots?: boolean;
}

export interface BasePlayerSettings {}

export interface Timestamp {
  value: number;
  pausedAt: number | null;
  timeLeft: number;
  timePassed: number;
  pause?(pausedAt: number): void;
  unpause?(unpausedAt: number): void;
}

export enum CommonGameClientEvent {
  TOGGLE_READY = '$$TOGGLE_READY',
  CHANGE_SETTING = '$$CHANGE_SETTING',
  TOGGLE_PAUSE = '$$TOGGLE_PAUSE',
}

export enum CommonGameServerEvent {
  UPDATE_PLAYERS = '$$UPDATE_PLAYERS',
  GET_DATA = '$$GET_DATA',
  GET_INFO = '$$GET_INFO',
  PING = '$$PING',
  PAUSE = '$$PAUSE',
  UNPAUSE = '$$UNPAUSE',
  END = '$$END',
}

export type ChangeSettingEvent<Game extends GameType> = {
  [K in keyof PlayerSettings<Game>]: {
    key: K;
    value: PlayerSettings<Game>[K];
  };
}[keyof PlayerSettings<Game>];

export interface CommonClientEventMap<Game extends GameType> {
  [CommonGameClientEvent.TOGGLE_PAUSE]: undefined;
  [CommonGameClientEvent.TOGGLE_READY]: undefined;
  [CommonGameClientEvent.CHANGE_SETTING]: ChangeSettingEvent<Game>;
}

export interface CommonServerEventMap<Game extends GameType> {
  [CommonGameServerEvent.PAUSE]: number;
  [CommonGameServerEvent.UNPAUSE]: number;
  [CommonGameServerEvent.GET_DATA]: GameData<Game>;
  [CommonGameServerEvent.GET_INFO]: GameInfo<Game>;
  [CommonGameServerEvent.UPDATE_PLAYERS]: GamePlayer<Game>[];
  [CommonGameServerEvent.PING]: number;
  [CommonGameServerEvent.END]: GameResult<Game>;
}
