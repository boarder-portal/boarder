import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
  IPlayerSettings as ICommonPlayerSettings,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {
  SEND_SET = 'SEND_SET',
  SEND_NO_SET = 'SEND_NO_SET',
}

export interface IGameOptions extends ICommonGameOptions {}

export interface IPlayerData {
  score: number;
}

export interface IPlayer extends IGamePlayer<EGame.SET> {
  data: IPlayerData;
}

export enum ECardColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
}

export enum ECardFill {
  EMPTY = 'empty',
  STRIPED = 'striped',
  FILLED = 'filled',
}

export enum ECardShape {
  WAVE = 'wave',
  OVAL = 'oval',
  RHOMBUS = 'rhombus',
}

export interface ICard {
  id: number;
  count: number;
  color: ECardColor;
  fill: ECardFill;
  shape: ECardShape;
}

export interface IGame {
  players: IPlayer[];
  cards: ICard[];
}

export interface ISendSetEvent {
  cardsIds: number[];
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.SET> {
  [EGameClientEvent.SEND_SET]: ISendSetEvent;
  [EGameClientEvent.SEND_NO_SET]: undefined;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.SET> {}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.SET]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
      result: number[];
      playerSettings: ICommonPlayerSettings;
    };
  }
}
