import { ICommonEventMap, IGameOptions as ICommonGameOptions, IGamePlayer } from 'common/types';
import { ICard } from 'common/types/cards';
import { EGame } from 'common/types/game';

export enum EGameEvent {
  // client events
  GET_GAME_INFO = 'GET_GAME_INFO',
  CHOOSE_CARD = 'CHOOSE_CARD',

  // server events
  GAME_INFO = 'GAME_INFO',
}

export interface IGameOptions extends ICommonGameOptions {}

export interface IGamePlayerData {
  score: number;
}

export interface IPlayerData extends IGamePlayerData {
  hand: IHandPlayerData | null;
  turn: ITurnPlayerData | null;
}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
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
  heartsEnteredPlay: boolean;
  turn: ITurn | null;
}

export interface ITurnPlayerData {
  playedCard: ICard | null;
}

export interface ITurn {
  startPlayerIndex: number;
  activePlayerIndex: number;
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

export interface IEventMap extends ICommonEventMap<EGame.HEARTS> {
  [EGameEvent.GET_GAME_INFO]: undefined;
  [EGameEvent.CHOOSE_CARD]: number;

  [EGameEvent.GAME_INFO]: IGame;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.HEARTS]: {
      eventMap: IEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
