import { IPlayer } from 'common/types';
import * as PexesoTypes from 'common/types/pexeso';
import {
  ESurvivalOnlineGameEvent,
  ISurvivalOnlineGameOptions,
  ISurvivalOnlinePlayer,
} from 'common/types/survivalOnline';
import * as MazeTypes from 'common/types/maze';
import * as SetTypes from 'common/types/set';
import * as OnitamaTypes from 'common/types/onitama';
import * as CarcassonneTypes from 'common/types/carcassonne';
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
    event: PexesoTypes.EGameEvent;
    options: PexesoTypes.IGameOptions;
    player: PexesoTypes.IPlayer;
  };
  [EGame.SURVIVAL_ONLINE]: {
    event: ESurvivalOnlineGameEvent;
    options: ISurvivalOnlineGameOptions;
    player: ISurvivalOnlinePlayer;
  };
  [EGame.MAZE]: {
    event: MazeTypes.EGameEvent;
    options: MazeTypes.IGameOptions;
    player: MazeTypes.IPlayer;
  };
  [EGame.SET]: {
    event: SetTypes.EGameEvent;
    options: SetTypes.IGameOptions;
    player: SetTypes.IPlayer;
  };
  [EGame.ONITAMA]: {
    event: OnitamaTypes.EGameEvent;
    options: OnitamaTypes.IGameOptions;
    player: OnitamaTypes.IPlayer;
  };
  [EGame.CARCASSONNE]: {
    event: CarcassonneTypes.EGameEvent;
    options: CarcassonneTypes.IGameOptions;
    player: CarcassonneTypes.IPlayer;
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
