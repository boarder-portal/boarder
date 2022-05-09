import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IPlayer as ICommonPlayer } from 'common/types';
import { ICard } from 'common/types/cards';
import { EGame } from 'common/types/game';

export enum EGameEvent {
  // client events
  GET_ROOT_STATE = 'GET_ROOT_STATE',
  CHOOSE_CARD = 'CHOOSE_CARD',

  // server events
  ROOT_INFO = 'ROOT_INFO',
}

export interface IGameOptions extends ICommonGameOptions {

}

export interface IPlayer extends ICommonPlayer {
  score: number;
}

export interface IGame {
  players: IPlayer[];
  passDirection: EPassDirection;
  hand: IHand | null;
}

export interface IHandPlayerData {
  hand: ICard[];
  chosenCardsIndexes: number[];
  takenCards: ICard[];
}

export interface IHand {
  stage: EHandStage;
  playersData: IHandPlayerData[];
  heartsEnteredPlay: boolean;
  turn: ITurn | null;
}

export interface ITurnPlayerData {
  playedCard: ICard | null;
}

export interface ITurn {
  startPlayerIndex: number;
  activePlayerIndex: number;
  playersData: ITurnPlayerData[];
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

  [EGameEvent.ROOT_INFO]: IGame;
}

declare module 'common/types/game' {
  export interface IGamesParams {
    [EGame.HEARTS]: {
      event: EGameEvent;
      eventMap: IEventMap;
      options: IGameOptions;
      player: IPlayer;
    };
  }
}
