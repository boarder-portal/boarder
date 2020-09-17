export enum EGame {
  PEXESO = 'pexeso',
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
