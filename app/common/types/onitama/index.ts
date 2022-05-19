import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { ICoords, IGamePlayer as ICommonPlayer } from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  MOVE_PIECE = 'MOVE_PIECE',

  GAME_INFO = 'GAME_INFO',
}

export interface IGameOptions extends ICommonGameOptions {}

export interface IGamePlayerData {
  cards: ECardType[];
  color: EPlayerColor;
}

export interface IPlayer extends ICommonPlayer {
  data: IGamePlayerData;
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

export interface IEventMap {
  [EGameEvent.GET_GAME_INFO]: undefined;
  [EGameEvent.MOVE_PIECE]: IMovePieceEvent;

  [EGameEvent.GAME_INFO]: IGame;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.ONITAMA]: {
      eventMap: IEventMap;
      options: IGameOptions;
      player: ICommonPlayer;
    };
  }
}
