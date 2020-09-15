import { IRoom } from 'common/types/room';

export enum ELobbyEvent {
  UPDATE = 'update',
  CREATE_ROOM = 'createRoom',
}

export interface ILobby {
  rooms: IRoom[];
}
