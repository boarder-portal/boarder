import { GamePlayer } from 'common/types';
import { GameOptions, GameType } from 'common/types/game/index';

export enum LobbyEventType {
  UPDATE = 'UPDATE',
  CREATE_GAME = 'CREATE_GAME',
  GAME_CREATED = 'GAME_CREATED',
}

export interface LobbyClientEventMap<Game extends GameType> {
  [LobbyEventType.CREATE_GAME]: GameOptions<Game>;
}

export interface LobbyServerEventMap<Game extends GameType> {
  [LobbyEventType.GAME_CREATED]: string;
  [LobbyEventType.UPDATE]: LobbyUpdateEvent<Game>;
}

export interface LobbyGame<Game extends GameType> {
  id: string;
  name: string;
  players: GamePlayer<Game>[];
  hasStarted: boolean;
  options: GameOptions<Game>;
}

export interface LobbyUpdateEvent<Game extends GameType> {
  games: LobbyGame<Game>[];
}
