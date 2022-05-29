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
}

export interface IGamesParams {}

export interface IGameData<Game extends EGame> {
  name: string;
  info: TGameInfo<Game> | null;
  players: IGamePlayer[];
}

export type TGameInfo<Game extends EGame> = IGamesParams[Game]['info'];

export type TGameClientEvent<Game extends EGame> = keyof TGameClientEventMap<Game> & string;

export type TGameServerEvent<Game extends EGame> = keyof TGameServerEventMap<Game> & string;

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
