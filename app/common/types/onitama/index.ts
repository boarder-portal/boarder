import {
  BaseGameOptions,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
  Coords,
  GamePlayer,
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

export interface Player extends GamePlayer<GameType.ONITAMA> {
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

export interface MovePieceEvent {
  from: Coords;
  to: Coords;
  cardIndex: number;
}

export interface ClientEventMap extends CommonClientEventMap<GameType.ONITAMA> {
  [GameClientEventType.MOVE_PIECE]: MovePieceEvent;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.ONITAMA> {}

type OnitamaGameOptions = GameOptions;

declare module 'common/types/game' {
  interface GamesParams {
    [GameType.ONITAMA]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: OnitamaGameOptions;
      info: Game;
      result: number;
      playerSettings: BasePlayerSettings;
    };
  }
}
