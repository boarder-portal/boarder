import { IPlayer } from 'common/types/index';
import { EPexesoGameEvent, IPexesoGameOptions, IPexesoPlayer } from 'common/types/pexeso';
import {
  ESurvivalOnlineGameEvent,
  ISurvivalOnlineGameOptions,
  ISurvivalOnlinePlayer,
} from 'common/types/survivalOnline';
import { EMazeGameEvent, IMazeGameOptions, IMazePlayer } from 'common/types/maze';
import { ESetGameEvent, ISetGameOptions, ISetPlayer } from 'common/types/set';
import { EOnitamaGameEvent, IOnitamaGameOptions, IOnitamaPlayer } from 'common/types/onitama';
import { ECarcassonneGameEvent, ICarcassonneGameOptions, ICarcassonnePlayer } from 'common/types/carcassonne';
import { ESevenWondersGameEvent, ISevenWondersGameOptions, ISevenWondersPlayer } from 'common/types/sevenWonders';

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
}

export type TGamePlayer<Game extends EGame> = IGameParams[Game]['player'];

export interface IGameParams {
  [EGame.PEXESO]: {
    event: EPexesoGameEvent;
    options: IPexesoGameOptions;
    player: IPexesoPlayer;
  };
  [EGame.SURVIVAL_ONLINE]: {
    event: ESurvivalOnlineGameEvent;
    options: ISurvivalOnlineGameOptions;
    player: ISurvivalOnlinePlayer;
  };
  [EGame.MAZE]: {
    event: EMazeGameEvent;
    options: IMazeGameOptions;
    player: IMazePlayer;
  };
  [EGame.SET]: {
    event: ESetGameEvent;
    options: ISetGameOptions;
    player: ISetPlayer;
  };
  [EGame.ONITAMA]: {
    event: EOnitamaGameEvent;
    options: IOnitamaGameOptions;
    player: IOnitamaPlayer;
  };
  [EGame.CARCASSONNE]: {
    event: ECarcassonneGameEvent;
    options: ICarcassonneGameOptions;
    player: ICarcassonnePlayer;
  };
  [EGame.SEVEN_WONDERS]: {
    event: ESevenWondersGameEvent;
    options: ISevenWondersGameOptions;
    player: ISevenWondersPlayer;
  };
}

export type TGameEvent<Game extends EGame> = IGameParams[Game]['event'];

export type TGameOptions<Game extends EGame> = IGameParams[Game]['options'];

export interface IGameUpdateEvent {
  id: string;
  players: IPlayer[];
}
