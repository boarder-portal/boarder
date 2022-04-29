import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IPlayer as ICommonPlayer } from 'common/types';
import { ICard } from 'common/types/cards';

export enum EGameEvent {
  // client events
  GET_GAME_INFO = 'GET_GAME_INFO',
  CHOOSE_CARD = 'CHOOSE_CARD',

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
  handScore: number;
  takenCards: ICard[];
}

export interface IGameInfoEvent {
  stage: EHandStage;
  players: IPlayer[];
  passDirection: EPassDirection;
  startTurnPlayerIndex: number;
  heartsEnteredPlay: boolean;
  isFirstTurn: boolean;
}

export interface IChooseCardEvent {
  cardIndex: number;
}

export enum EHandStage {
  PASS = 'PASS',
  PLAY = 'PLAY',
}

export enum EPassDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  ACROSS = 'ACROSS',
  NONE = 'NONE',
}
