import { IPexesoGameOptions, IPexesoPlayer } from 'common/types/pexeso';
import { ISurvivalOnlineGameOptions, ISurvivalOnlinePlayer } from 'common/types/survivalOnline';

export enum EGame {
  PEXESO = 'pexeso',
  SURVIVAL_ONLINE = 'survivalOnline',
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
}

export interface IPlayer extends IUser {
  status: EPlayerStatus;
}

export type TGamePlayer<Game extends EGame> = IGameParams[Game]['player'];

export interface IGameParams {
  pexeso: {
    options: IPexesoGameOptions;
    player: IPexesoPlayer;
  };
  survivalOnline: {
    options: ISurvivalOnlineGameOptions;
    player: ISurvivalOnlinePlayer;
  };
}
