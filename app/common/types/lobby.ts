import { IRoom } from 'common/types/room';
import { EGame, IPlayer } from 'common/types/index';
import { TGameOptions } from 'common/types/game';

export enum ELobbyEvent {
  UPDATE = 'update',
  CREATE_ROOM = 'createRoom',
  ENTER_ROOM = 'enterRoom',
}

export interface ILobby<Game extends EGame> {
  game: Game;
  rooms: IRoom<Game>[];
}

export interface ILobbyUpdateEvent<Game extends EGame> {
  rooms: {
    id: string;
    players: IPlayer[];
    gameIsStarted: boolean;
    options: TGameOptions<Game>;
  }[];
}
