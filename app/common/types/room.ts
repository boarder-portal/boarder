import { IUser } from 'common/types/index';

export interface IRoom {
  id: string;
  players: IUser[];
}
