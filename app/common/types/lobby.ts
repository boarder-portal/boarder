import { IGamePlayer } from 'common/types';
import { EGame, TGameOptions } from 'common/types/game';

export enum ELobbyEvent {
  UPDATE = 'UPDATE',
  CREATE_GAME = 'CREATE_GAME',
  GAME_CREATED = 'GAME_CREATED',
}

export interface ILobbyClientEventMap<Game extends EGame> {
  [ELobbyEvent.CREATE_GAME]: TGameOptions<Game>;
}

export interface ILobbyServerEventMap<Game extends EGame> {
  [ELobbyEvent.GAME_CREATED]: string;
  [ELobbyEvent.UPDATE]: ILobbyUpdateEvent<Game>;
}

export interface ILobbyGame<Game extends EGame> {
  id: string;
  name: string;
  players: IGamePlayer<Game>[];
  hasStarted: boolean;
  options: TGameOptions<Game>;
}

export interface ILobbyUpdateEvent<Game extends EGame> {
  games: ILobbyGame<Game>[];
}
