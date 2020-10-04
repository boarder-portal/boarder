import { EGame, IGameParams, IPlayer } from 'common/types/index';

export enum EGameEvent {
  UPDATE = 'UPDATE',
  END = 'END',
}

export type TGameEvent<Game extends EGame> = IGameParams[Game]['event'];

export interface IGame {
  id: string;
  players: IPlayer[];
}

export type TGameOptions<Game extends EGame> = IGameParams[Game]['options'];

export interface ICoords {
  x: number;
  y: number;
}
