import { EGame } from 'common/types/game';

import Room from 'server/gamesData/Room/Room';

export enum ERoomEvent {
  UPDATE = 'UPDATE',
  TOGGLE_USER_STATE = 'TOGGLE_USER_STATE',
  START_GAME = 'START_GAME',
}

export interface IGameOptions {
  playersCount: number;
}

export interface IRoomUpdateEvent<Game extends EGame> {
  id: Room<Game>['id'];
  players: Room<Game>['players'];
  options: Room<Game>['options'];
}

export interface IRoomEventMap<Game extends EGame> {
  [ERoomEvent.TOGGLE_USER_STATE]: undefined;

  [ERoomEvent.UPDATE]: IRoomUpdateEvent<Game>;
  [ERoomEvent.START_GAME]: string;
}
