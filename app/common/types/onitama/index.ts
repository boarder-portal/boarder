import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { ICoords, IPlayer as ICommonPlayer } from 'common/types';

export enum EGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  MOVE_PIECE = 'MOVE_PIECE',

  GAME_INFO = 'GAME_INFO',
}

export interface IGameOptions extends ICommonGameOptions {

}

export interface IPlayer extends ICommonPlayer {
  isActive: boolean;
  cards: ECardType[];
  color: EPlayerColor;
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

export interface IGameInfoEvent {
  board: TBoard;
  players: IPlayer[];
  fifthCard: ECardType;
}

export interface IMovePieceEvent {
  from: ICoords;
  to: ICoords;
  cardIndex: number;
}
