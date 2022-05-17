import { IGamePlayer as ICommonPlayer } from 'common/types';
import * as SurvivalOnlineTypes from 'common/types/survivalOnline';
import * as MazeTypes from 'common/types/maze';

export enum ECommonGameEvent {
  UPDATE = 'UPDATE',
  END = 'END',
}

export enum EGame {
  PEXESO = 'pexeso',
  SURVIVAL_ONLINE = 'survivalOnline',
  MAZE = 'maze',
  SET = 'set',
  ONITAMA = 'onitama',
  CARCASSONNE = 'carcassonne',
  SEVEN_WONDERS = 'sevenWonders',
  HEARTS = 'hearts',
}

export interface IGamesParams {
  [EGame.SURVIVAL_ONLINE]: {
    event: SurvivalOnlineTypes.EGameEvent;
    eventMap: any;
    options: SurvivalOnlineTypes.IGameOptions;
    player: SurvivalOnlineTypes.IPlayer;
  };
  [EGame.MAZE]: {
    event: MazeTypes.EGameEvent;
    eventMap: any;
    options: MazeTypes.IGameOptions;
    player: MazeTypes.IPlayer;
  };
}

export type TGamePlayer<Game extends EGame> = IGamesParams[Game]['player'];

export type TGameEvent<Game extends EGame> = IGamesParams[Game]['event'];

export type TGameEventData<Game extends EGame, Event extends TGameEvent<Game>> = IGamesParams[Game]['eventMap'][Event];

export type TGameEventListener<Game extends EGame, Event extends TGameEvent<Game>> = (
  data: TGameEventData<Game, Event>,
) => unknown;

export type TGameOptions<Game extends EGame> = IGamesParams[Game]['options'];

export interface IGameUpdateEvent {
  id: string;
  players: ICommonPlayer[];
}
