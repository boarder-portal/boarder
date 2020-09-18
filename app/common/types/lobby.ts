import { IRoom } from 'common/types/room';
import { IPlayer } from 'common/types/index';

export enum ELobbyEvent {
  UPDATE = 'update',
  CREATE_ROOM = 'createRoom',
  ENTER_ROOM = 'enterRoom',
}

export interface ILobby<Options, Player extends IPlayer> {
  rooms: IRoom<Options, Player>[];
}
