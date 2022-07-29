import { IGamePlayer } from 'common/types';

export enum EGame {
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

export interface IGamesParams {}

export interface IGameData<Game extends EGame> {
  name: string;
  options: TGameOptions<Game>;
  info: TGameInfo<Game> | null;
  result: TGameResult<Game> | null;
  players: IGamePlayer[];
  timestamp: number;
}

export type TGameInfo<Game extends EGame> = IGamesParams[Game]['info'];

export type TGameResult<Game extends EGame> = IGamesParams[Game]['result'];

export type TGameClientEvent<Game extends EGame> = keyof TGameClientEventMap<Game> & string;

export type TGameClientDatalessEvent<Game extends EGame> = {
  [Event in TGameClientEvent<Game>]: TGameClientEventData<Game, Event> extends undefined ? Event : never;
}[TGameClientEvent<Game>];

export type TGameServerEvent<Game extends EGame> = keyof TGameServerEventMap<Game> & string;

export type TGameServerDatalessEvent<Game extends EGame> = {
  [Event in TGameServerEvent<Game>]: TGameServerEventData<Game, Event> extends undefined ? Event : never;
}[TGameServerEvent<Game>];

export type TGameClientEventMap<Game extends EGame> = IGamesParams[Game]['clientEventMap'];

export type TGameServerEventMap<Game extends EGame> = IGamesParams[Game]['serverEventMap'];

export type TGameClientEventData<
  Game extends EGame,
  Event extends TGameClientEvent<Game>,
> = TGameClientEventMap<Game>[Event];

export type TGameServerEventData<
  Game extends EGame,
  Event extends TGameServerEvent<Game>,
> = TGameServerEventMap<Game>[Event];

export type TGameClientEventListener<Game extends EGame, Event extends TGameClientEvent<Game>> = (
  data: TGameClientEventData<Game, Event>,
) => unknown;

export type TGameServerEventListener<Game extends EGame, Event extends TGameServerEvent<Game>> = (
  data: TGameServerEventData<Game, Event>,
) => unknown;

export type TGameOptions<Game extends EGame> = IGamesParams[Game]['options'];
