import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  ICoords,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {
  MOVE_PIECE = 'MOVE_PIECE',
}

export interface IGameOptions extends ICommonGameOptions {}

export interface IPlayerData {
  cards: ECardType[];
  color: EPlayerColor;
}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
}

export enum ECardType {
  TIGER = 'TIGER',
  DRAGON = 'DRAGON',
  FROG = 'FROG',
  RABBIT = 'RABBIT',
  CRAB = 'CRAB',
  ELEPHANT = 'ELEPHANT',
  GOOSE = 'GOOSE',
  ROOSTER = 'ROOSTER',
  MONKEY = 'MONKEY',
  MANTIS = 'MANTIS',
  HORSE = 'HORSE',
  OX = 'OX',
  CRANE = 'CRANE',
  BOAR = 'BOAR',
  EEL = 'EEL',
  COBRA = 'COBRA',
}

export enum EPlayerColor {
  BLUE = 'BLUE',
  RED = 'RED',
}

export interface IPiece {
  color: EPlayerColor;
  isMaster: boolean;
}

export type TBoard = (IPiece | null)[][];

export interface IGame {
  board: TBoard;
  players: IPlayer[];
  fifthCard: ECardType;
  activePlayerIndex: number;
}

export interface IMovePieceEvent {
  from: ICoords;
  to: ICoords;
  cardIndex: number;
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.ONITAMA> {
  [EGameClientEvent.MOVE_PIECE]: IMovePieceEvent;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.ONITAMA> {}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.ONITAMA]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
