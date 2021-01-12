import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { ICoords } from 'common/types/game';

export enum EOnitamaGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  MOVE_PIECE = 'MOVE_PIECE',

  GAME_INFO = 'GAME_INFO',
}

export interface IOnitamaGameOptions extends ICommonGameOptions {

}

export interface IOnitamaPlayer extends IPlayer {
  isActive: boolean;
  cards: EOnitamaCardType[];
  color: EOnitamaPlayerColor;
}

export enum EOnitamaCardType {
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

export enum EOnitamaPlayerColor {
  BLUE = 'BLUE',
  RED = 'RED',
}

export interface IOnitamaPiece {
  color: EOnitamaPlayerColor;
  isMaster: boolean;
}

export type TOnitamaBoard = (IOnitamaPiece | null)[][];

export interface IOnitamaGameInfoEvent {
  board: TOnitamaBoard;
  players: IOnitamaPlayer[];
  fifthCard: EOnitamaCardType;
}

export interface IOnitamaMovePieceEvent {
  from: ICoords;
  to: ICoords;
  cardIndex: number;
}
