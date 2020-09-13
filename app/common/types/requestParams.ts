import { IDBUser } from 'common/types/index';

export interface IRegisterParams {
  user: IDBUser;
}

export interface ILoginParams {
  user: IDBUser;
}
