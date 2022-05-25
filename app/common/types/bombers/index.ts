import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {}

export interface IGameOptions extends ICommonGameOptions {}

export interface IGamePlayerData {}

export interface IPlayerData extends IGamePlayerData {}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
}

export interface IGame {
  players: IPlayer[];
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.BOMBERS> {}

export interface IServerEventMap extends ICommonServerEventMap<EGame.BOMBERS> {}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.BOMBERS]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
