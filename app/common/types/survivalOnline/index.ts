import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { IPexesoPlayer } from 'common/types/pexeso';

export enum ESurvivalOnlineGameEvent {
  GAME_INFO = 'GAME_INFO',
  GET_GAME_INFO = 'GET_GAME_INFO',
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',
}

export type ISurvivalOnlineGameOptions = ICommonGameOptions

export type ISurvivalOnlinePlayer = IPlayer

export interface ISurvivalOnlineGameInfoEvent {
  players: IPexesoPlayer[];
}

