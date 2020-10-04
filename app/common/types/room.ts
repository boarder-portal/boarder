import { EGame, IPlayer } from 'common/types/index';
import { TGameOptions } from 'common/types/game';

export enum ERoomEvent {
  UPDATE = 'UPDATE',
  TOGGLE_USER_STATE = 'TOGGLE_USER_STATE',
  START_GAME = 'START_GAME',
}

export interface ICommonGameOptions {
  playersCount: number;
}

export interface IRoom<Game extends EGame> {
  id: string;
  players: IPlayer[];
  options: TGameOptions<Game>;
  deleteRoom(): void;
}
