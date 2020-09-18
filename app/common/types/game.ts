import { IPlayer } from 'common/types/index';
import { IPexesoGameOptions } from 'common/types/pexeso';

export enum EGameEvent {
  UPDATE = 'UPDATE',
  GAME_EVENT = 'GAME_EVENT',
}

export interface IGame {
  id: string;
  players: IPlayer[];
}

export type TGameOptions = IPexesoGameOptions;
