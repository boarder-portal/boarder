import { IPlayer } from 'common/types/index';
import { IPexesoRoomOptions } from 'common/types/pexeso';

export enum ERoomEvent {
  UPDATE = 'UPDATE',
  TOGGLE_USER_STATE = 'TOGGLE_USER_STATE',
  START_GAME = 'START_GAME',
}

export interface IRoom {
  id: string;
  players: IPlayer[];
  options: IPexesoRoomOptions;
}
