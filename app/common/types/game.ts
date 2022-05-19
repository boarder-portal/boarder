import { IGamePlayer as ICommonPlayer } from 'common/types';
import * as SurvivalOnlineTypes from 'common/types/survivalOnline';

export enum ECommonGameEvent {
  UPDATE = 'UPDATE',
  END = 'END',
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

export interface IGamesParams {
  [EGame.SURVIVAL_ONLINE]: {
    eventMap: SurvivalOnlineTypes.IEventMap;
    options: SurvivalOnlineTypes.IGameOptions;
    player: SurvivalOnlineTypes.IPlayer;
  };
}

export type TGamePlayer<Game extends EGame> = IGamesParams[Game]['player'];

export type TGameEvent<Game extends EGame> = keyof TGameEventMap<Game> & string;

export type TGameEventMap<Game extends EGame> = IGamesParams[Game]['eventMap'];

export type TGameEventArgs<
  Game extends EGame,
  Event extends keyof TGameEventMap<Game>,
> = TGameEventMap<Game>[Event] extends undefined ? [] : [TGameEventMap<Game>[Event]];

export type TGameSocketEventMap<Game extends EGame> = {
  [Event in keyof TGameEventMap<Game>]: (...args: TGameEventArgs<Game, Event>) => void;
};

export type TGameEventData<Game extends EGame, Event extends TGameEvent<Game>> = TGameEventMap<Game>[Event];

export type TGameEventListener<Game extends EGame, Event extends TGameEvent<Game>> = (
  data: TGameEventData<Game, Event>,
) => unknown;

export type TGameOptions<Game extends EGame> = IGamesParams[Game]['options'];

export interface IGameUpdateEvent {
  id: string;
  players: ICommonPlayer[];
}
