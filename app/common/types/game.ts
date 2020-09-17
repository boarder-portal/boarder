import { IPlayer } from 'common/types/index';

export enum EGameEvent {
  UPDATE = 'UPDATE',
  GAME_EVENT = 'GAME_EVENT',
}

export interface IGame {
  id: string;
  players: IPlayer[];
}
