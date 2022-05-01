import { IPlayer } from 'common/types';
import * as PexesoTypes from 'common/types/pexeso';
import * as SurvivalOnlineTypes from 'common/types/survivalOnline';
import * as MazeTypes from 'common/types/maze';
import * as SetTypes from 'common/types/set';
import * as OnitamaTypes from 'common/types/onitama';
import * as CarcassonneTypes from 'common/types/carcassonne';
import * as SevenWondersTypes from 'common/types/sevenWonders';
import * as HeartsTypes from 'common/types/hearts';

export enum EGameEvent {
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
  [EGame.PEXESO]: {
    event: PexesoTypes.EGameEvent;
    eventMap: any;
    options: PexesoTypes.IGameOptions;
    player: PexesoTypes.IPlayer;
  };
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
  [EGame.SET]: {
    event: SetTypes.EGameEvent;
    eventMap: any;
    options: SetTypes.IGameOptions;
    player: SetTypes.IPlayer;
  };
  [EGame.ONITAMA]: {
    event: OnitamaTypes.EGameEvent;
    eventMap: any;
    options: OnitamaTypes.IGameOptions;
    player: OnitamaTypes.IPlayer;
  };
  [EGame.CARCASSONNE]: {
    event: CarcassonneTypes.EGameEvent;
    eventMap: any;
    options: CarcassonneTypes.IGameOptions;
    player: CarcassonneTypes.IPlayer;
  };
  [EGame.SEVEN_WONDERS]: {
    event: SevenWondersTypes.EGameEvent;
    eventMap: any;
    options: SevenWondersTypes.IGameOptions;
    player: SevenWondersTypes.IPlayer;
  };
  [EGame.HEARTS]: {
    event: HeartsTypes.EGameEvent;
    eventMap: HeartsTypes.IEventMap;
    options: HeartsTypes.IGameOptions;
    player: HeartsTypes.IPlayer;
  };
}

export type TGamePlayer<Game extends EGame> = IGamesParams[Game]['player'];

export type TGameEvent<Game extends EGame> = IGamesParams[Game]['event'];

export type TGameEventData<Game extends EGame, Event extends TGameEvent<Game>> = IGamesParams[Game]['eventMap'][Event];

export type TGameEventListener<Game extends EGame, Event extends TGameEvent<Game>> = (data: TGameEventData<Game, Event>) => unknown;

export type TGameOptions<Game extends EGame> = IGamesParams[Game]['options'];

export interface IGameUpdateEvent {
  id: string;
  players: IPlayer[];
}
