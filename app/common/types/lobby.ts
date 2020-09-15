import { IRoom } from 'common/types/room';

export enum ELobbyEvent {
  UPDATE = 'update',
  CREATE_ROOM = 'createRoom',
  ENTER_ROOM = 'enterRoom',
}

export interface ILobby {
  rooms: IRoom[];
}
