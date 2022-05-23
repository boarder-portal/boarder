import { IGamePlayer } from 'common/types';
import { EGame, TGameOptions } from 'common/types/game';

export enum ELobbyEvent {
  UPDATE = 'update',
  CREATE_GAME = 'createGame',
}

export interface ILobbyEventMap<Game extends EGame> {
  [ELobbyEvent.CREATE_GAME]: TGameOptions<Game>;

  [ELobbyEvent.UPDATE]: ILobbyUpdateEvent<Game>;
}

export interface ILobbyGame<Game extends EGame> {
  id: string;
  players: IGamePlayer[];
  hasStarted: boolean;
  options: TGameOptions<Game>;
}

export interface ILobbyUpdateEvent<Game extends EGame> {
  games: ILobbyGame<Game>[];
}
