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

export interface ICoords {
  x: number;
  y: number;
}
