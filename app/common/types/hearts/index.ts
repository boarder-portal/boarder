import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IPlayer as ICommonPlayer } from 'common/types';
import { ICard } from 'common/types/cards';

export enum EGameEvent {
  // client events
  GET_ROOT_STATE = 'GET_ROOT_STATE',
  CHOOSE_CARD = 'CHOOSE_CARD',

  // server events
  ROOT_STATE = 'ROOT_STATE',
}

export interface IGameOptions extends ICommonGameOptions {

}

export interface IPlayer extends ICommonPlayer {
  score: number;
}

export interface IRootState {
  players: IPlayer[];
  handIndex: number;
  passDirection: EPassDirection;
  handState: IHandState;
}

export interface IHandState {
  stage: EHandStage;
  hands: ICard[][];
  chosenCardsIndexes: number[][];
  takenCards: ICard[][];
  heartsEnteredPlay: boolean;
  turnState: ITurnState;
}

export interface ITurnState {
  startPlayerIndex: number;
  activePlayerIndex: number;
  playedCards: (ICard | null)[];
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

export interface IEventMap {
  [EGameEvent.GET_ROOT_STATE]: undefined;
  [EGameEvent.CHOOSE_CARD]: IChooseCardEvent;

  [EGameEvent.ROOT_STATE]: IRootState;
}
