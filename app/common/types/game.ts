import { TSocketEventMap } from 'common/types/socket';
import { IGamePlayer } from 'common/types/index';

export enum EGame {
  PEXESO = 'pexeso',
  SURVIVAL_ONLINE = 'survivalOnline',
  SET = 'set',
  ONITAMA = 'onitama',
  CARCASSONNE = 'carcassonne',
  SEVEN_WONDERS = 'sevenWonders',
  HEARTS = 'hearts',
}

export interface IGamesParams {}

export interface IGameData<Game extends EGame> {
  name: string;
  info: TGameInfo<Game> | null;
  players: IGamePlayer[];
}

export type TGameInfo<Game extends EGame> = IGamesParams[Game]['info'];

export type TGameEvent<Game extends EGame> = keyof TGameEventMap<Game> & string;

export type TGameEventMap<Game extends EGame> = IGamesParams[Game]['eventMap'];

export type TGameSocketEventMap<Game extends EGame> = TSocketEventMap<TGameEventMap<Game>>;

export type TGameEventData<Game extends EGame, Event extends TGameEvent<Game>> = TGameEventMap<Game>[Event];

export type TGameEventListener<Game extends EGame, Event extends TGameEvent<Game>> = (
  data: TGameEventData<Game, Event>,
) => unknown;

export type TGameOptions<Game extends EGame> = IGamesParams[Game]['options'];
