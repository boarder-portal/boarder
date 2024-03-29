import { BaseGamePlayer } from 'common/types';
import { GameOptions, GameStatus, GameType } from 'common/types/game';

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
  status: GameStatus;
  players: BaseGamePlayer<Game>[];
  options: GameOptions<Game>;
}

export interface LobbyUpdateEvent<Game extends GameType> {
  games: LobbyGame<Game>[];
}
