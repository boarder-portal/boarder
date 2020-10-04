import { EPexesoGameEvent, IPexesoGameOptions, IPexesoPlayer } from 'common/types/pexeso';
import {
  ESurvivalOnlineGameEvent,
  ISurvivalOnlineGameOptions,
  ISurvivalOnlinePlayer,
} from 'common/types/survivalOnline';
import { EMazeGameEvent, IMazeGameOptions, IMazePlayer } from 'common/types/maze';

export enum EGame {
  PEXESO = 'pexeso',
  SURVIVAL_ONLINE = 'survivalOnline',
  MAZE = 'maze',
}

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

export interface IPlayer extends IUser {
  status: EPlayerStatus;
}

export type TGamePlayer<Game extends EGame> = IGameParams[Game]['player'];

export interface IGameParams {
  pexeso: {
    event: EPexesoGameEvent;
    options: IPexesoGameOptions;
    player: IPexesoPlayer;
  };
  survivalOnline: {
    event: ESurvivalOnlineGameEvent;
    options: ISurvivalOnlineGameOptions;
    player: ISurvivalOnlinePlayer;
  };
  maze: {
    event: EMazeGameEvent;
    options: IMazeGameOptions;
    player: IMazePlayer;
  };
}
