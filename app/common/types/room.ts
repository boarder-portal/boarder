import { IPlayer } from 'common/types/index';

export enum ERoomEvent {
  UPDATE = 'UPDATE',
  TOGGLE_USER_STATE = 'TOGGLE_USER_STATE',
  START_GAME = 'START_GAME',
}

export interface ICommonGameOptions {
  playersCount: number;
}

export interface IRoom<Options = ICommonGameOptions, Player extends IPlayer = IPlayer> {
  id: string;
  players: Player[];
  options: Options;
}
