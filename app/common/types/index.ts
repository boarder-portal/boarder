export enum EGame {
  PEXESO = 'pexeso',
}

export interface IUser {
  login: string;
}

export interface IDBUser extends IUser {
  password: string;
}
