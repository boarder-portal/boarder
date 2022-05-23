import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
} from 'common/types';
import { ICard } from 'common/types/cards';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {
  CHOOSE_CARD = 'CHOOSE_CARD',
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

export interface IClientEventMap extends ICommonClientEventMap<EGame.HEARTS> {
  [EGameClientEvent.CHOOSE_CARD]: number;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.HEARTS> {}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.HEARTS]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
