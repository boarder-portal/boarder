import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IPlayer as ICommonPlayer } from 'common/types';
import { ICard } from 'common/types/cards';

export enum EGameEvent {
  // client events
  GET_GAME_INFO = 'GET_GAME_INFO',

  // server events
  GAME_INFO = 'GAME_INFO',
}

export interface IGameOptions extends ICommonGameOptions {

}

export interface IPlayer extends ICommonPlayer {
  isActive: boolean;
  hand: ICard[];
  playedCard: ICard | null;
  chosenCardsIndexes: number[];
  score: number;
}

export interface IGameInfo {
  players: IPlayer[];
}
