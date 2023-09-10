import { GamePlayer } from 'common/types';

export enum GameType {
  PEXESO = 'pexeso',
  SURVIVAL_ONLINE = 'survivalOnline',
  SET = 'set',
  ONITAMA = 'onitama',
  CARCASSONNE = 'carcassonne',
  SEVEN_WONDERS = 'sevenWonders',
  HEARTS = 'hearts',
  BOMBERS = 'bombers',
  MACHI_KORO = 'machiKoro',
  MAHJONG = 'mahjong',
}

export interface GamesParams {}

export interface GameState {
  type: 'paused' | 'active';
  changeTimestamp: number;
}

export interface GameData<Game extends GameType> {
  name: string;
  options: GameOptions<Game>;
  info: GameInfo<Game> | null;
  result: GameResult<Game> | null;
  players: GamePlayer<Game>[];
  timestamp: number;
  state: GameState;
}

export type GameInfo<Game extends GameType> = GamesParams[Game]['info'];

export type GameResult<Game extends GameType> = GamesParams[Game]['result'];

export type GameClientEvent<Game extends GameType> = keyof GameClientEventMap<Game> & string;

export type GameClientDatalessEvent<Game extends GameType> = {
  [Event in GameClientEvent<Game>]: GameClientEventData<Game, Event> extends undefined ? Event : never;
}[GameClientEvent<Game>];

export type GameServerEvent<Game extends GameType> = keyof GameServerEventMap<Game> & string;

export type GameServerDatalessEvent<Game extends GameType> = {
  [Event in GameServerEvent<Game>]: GameServerEventData<Game, Event> extends undefined ? Event : never;
}[GameServerEvent<Game>];

export type GameClientEventMap<Game extends GameType> = GamesParams[Game]['clientEventMap'];

export type GameServerEventMap<Game extends GameType> = GamesParams[Game]['serverEventMap'];

export type GameClientEventData<
  Game extends GameType,
  Event extends GameClientEvent<Game>,
> = GameClientEventMap<Game>[Event];

export type GameServerEventData<
  Game extends GameType,
  Event extends GameServerEvent<Game>,
> = GameServerEventMap<Game>[Event];

export type GameClientEventListener<Game extends GameType, Event extends GameClientEvent<Game>> = (
  data: GameClientEventData<Game, Event>,
) => unknown;

export type GameServerEventListener<Game extends GameType, Event extends GameServerEvent<Game>> = (
  data: GameServerEventData<Game, Event>,
) => unknown;

export type GameOptions<Game extends GameType> = GamesParams[Game]['options'];

export type PlayerSettings<Game extends GameType> = GamesParams[Game]['playerSettings'];
