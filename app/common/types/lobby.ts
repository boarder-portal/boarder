import { IRoom } from 'common/types/room';
import { EGame } from 'common/types/index';

export enum ELobbyEvent {
  UPDATE = 'update',
  CREATE_ROOM = 'createRoom',
  ENTER_ROOM = 'enterRoom',
}

export interface ILobby<Game extends EGame> {
  game: Game;
  rooms: IRoom<Game>[];
}
