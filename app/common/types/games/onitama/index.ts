import {
  BaseGameOptions,
  BaseGamePlayer,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
  Coords,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  MOVE_PIECE = 'MOVE_PIECE',
}

export interface GameOptions extends BaseGameOptions {}

export interface PlayerData {
  cards: CardType[];
  color: PlayerColor;
}

export interface Player extends BaseGamePlayer<GameType.ONITAMA> {
  data: PlayerData;
}

export enum CardType {
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

export enum PlayerColor {
  BLUE = 'BLUE',
  RED = 'RED',
}

export interface Piece {
  color: PlayerColor;
  isMaster: boolean;
}

export type Board = (Piece | null)[][];

export interface Game {
  board: Board;
  players: Player[];
  fifthCard: CardType;
  activePlayerIndex: number;
}

export type GameResult = number;

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface MovePieceEvent {
  from: Coords;
  to: Coords;
  cardIndex: number;
}

export interface ClientEventMap extends CommonClientEventMap<GameType.ONITAMA> {
  [GameClientEventType.MOVE_PIECE]: MovePieceEvent;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.ONITAMA> {}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.ONITAMA]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: GameOptions;
      info: Game;
      result: GameResult;
      playerSettings: PlayerSettings;
      testCaseType: TestCaseType;
      gameEventType: GameEventType;
    };
  }
}
