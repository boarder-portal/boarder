import { TSocketEventMap } from 'common/types/socket';
import { IGamePlayer } from 'common/types/index';

export enum ECommonGameEvent {
  TOGGLE_READY = '$$TOGGLE_READY',
  UPDATE_PLAYERS = '$$UPDATE_PLAYERS',
  GET_DATA = '$$GET_DATA',
  GET_INFO = '$$GET_INFO',
  END = '$$END',
}

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

export interface ICommonEventMap<Game extends EGame> {
  [ECommonGameEvent.TOGGLE_READY]: undefined;

  [ECommonGameEvent.GET_DATA]: IGameData<Game>;
  [ECommonGameEvent.GET_INFO]: TGameInfo<Game>;
  [ECommonGameEvent.UPDATE_PLAYERS]: IGamePlayer[];
  [ECommonGameEvent.END]: undefined;
}

export interface IGameData<Game extends EGame> {
  info: TGameInfo<Game> | null;
  players: IGamePlayer[];
}

export interface IGameOptions {
  playersCount: number;
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
