import { IPlayer } from 'common/types/index';

export enum ERoomEvent {
  UPDATE = 'UPDATE',
  TOGGLE_USER_STATE = 'TOGGLE_USER_STATE',
}

export interface IRoom {
  id: string;
  players: IPlayer[];
}
