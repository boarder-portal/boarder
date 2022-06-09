import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {}

export enum EGameServerEvent {}

export interface IGameOptions extends ICommonGameOptions {}

export interface IPlayerData {}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
}

export interface IGame {
  players: IPlayer[];
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.MAHJONG> {}

export interface IServerEventMap extends ICommonServerEventMap<EGame.MAHJONG> {}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.MAHJONG]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
