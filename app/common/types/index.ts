import { z } from 'zod';

import { userSchema } from 'common/api/auth';

import { GameData, GameInfo, GameResult, GameState, GameType, PlayerSettings, TestCaseType } from 'common/types/game';

export type User = z.infer<typeof userSchema>;

export enum PlayerStatus {
  READY = 'READY',
  NOT_READY = 'NOT_READY',
  PLAYING = 'PLAYING',
  DISCONNECTED = 'DISCONNECTED',
}

export interface BaseGamePlayer<Game extends GameType> extends User {
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

export interface BaseGameOptions<Game extends GameType> {
  minPlayersCount: number;
  maxPlayersCount: number;
  useBots?: boolean;
  destroyOnLeave?: boolean;
  testCaseType?: TestCaseType<Game>;
}

export interface BasePlayerSettings {}

export interface Timestamp {
  value: number;
  pausedAt: number | null;
}

export enum CommonGameClientEvent {
  TOGGLE_READY = '$$TOGGLE_READY',
  CHANGE_SETTING = '$$CHANGE_SETTING',
  PAUSE = '$$PAUSE',
  UNPAUSE = '$$UNPAUSE',
}

export enum CommonGameServerEvent {
  UPDATE_PLAYERS = '$$UPDATE_PLAYERS',
  UPDATE_STATE = '$$UPDATE_STATE',
  GET_DATA = '$$GET_DATA',
  GET_INFO = '$$GET_INFO',
  PING = '$$PING',
  END = '$$END',
}

export type ChangeSettingEvent<Game extends GameType> = {
  [K in keyof PlayerSettings<Game>]: {
    key: K;
    value: PlayerSettings<Game>[K];
  };
}[keyof PlayerSettings<Game>];

export interface CommonClientEventMap<Game extends GameType> {
  [CommonGameClientEvent.PAUSE]: undefined;
  [CommonGameClientEvent.UNPAUSE]: undefined;
  [CommonGameClientEvent.TOGGLE_READY]: undefined;
  [CommonGameClientEvent.CHANGE_SETTING]: ChangeSettingEvent<Game>;
}

export interface CommonServerEventMap<Game extends GameType> {
  [CommonGameServerEvent.UPDATE_STATE]: GameState;
  [CommonGameServerEvent.GET_DATA]: GameData<Game>;
  [CommonGameServerEvent.GET_INFO]: GameInfo<Game>;
  [CommonGameServerEvent.UPDATE_PLAYERS]: BaseGamePlayer<Game>[];
  [CommonGameServerEvent.PING]: number;
  [CommonGameServerEvent.END]: GameResult<Game>;
}

export interface CommonGameEventMap<Game extends GameType> {}
