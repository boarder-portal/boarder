import { IPlayer } from 'common/types/index';
import { EGame, TGameOptions } from 'common/types/game';

export enum ELobbyEvent {
  UPDATE = 'update',
  CREATE_ROOM = 'createRoom',
  ENTER_ROOM = 'enterRoom',
}

export interface ILobbyUpdateEvent<Game extends EGame> {
  rooms: {
    id: string;
    players: IPlayer[];
    gameIsStarted: boolean;
    options: TGameOptions<Game>;
  }[];
}
