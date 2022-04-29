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

export type TGamePlayer<Game extends EGame> = IGameParams[Game]['player'];

export interface IGameParams {
  [EGame.PEXESO]: {
    event: PexesoTypes.EGameEvent;
    options: PexesoTypes.IGameOptions;
    player: PexesoTypes.IPlayer;
  };
  [EGame.SURVIVAL_ONLINE]: {
    event: SurvivalOnlineTypes.EGameEvent;
    options: SurvivalOnlineTypes.IGameOptions;
    player: SurvivalOnlineTypes.IPlayer;
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
    event: SevenWondersTypes.EGameEvent;
    options: SevenWondersTypes.IGameOptions;
    player: SevenWondersTypes.IPlayer;
  };
  [EGame.HEARTS]: {
    event: HeartsTypes.EGameEvent;
    options: HeartsTypes.IGameOptions;
    player: HeartsTypes.IPlayer;
  };
}

export type TGameEvent<Game extends EGame> = IGameParams[Game]['event'];

export type TGameOptions<Game extends EGame> = IGameParams[Game]['options'];

export interface IGameUpdateEvent {
  id: string;
  players: IPlayer[];
}
