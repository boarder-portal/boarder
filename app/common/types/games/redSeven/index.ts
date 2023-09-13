import {
  BaseGameOptions,
  BaseGamePlayer,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  PLAY_MOVE = 'PLAY_MOVE',
  REVERT_LAST_MOVE = 'REVERT_LAST_MOVE',
}

export enum GameServerEventType {}

export interface GameOptions extends BaseGameOptions {
  advancedRules: boolean;
  withActionRule: boolean;
  v1p2Rules: boolean;
}

export interface GamePlayerData {
  scoreCards: Card[];
}

export interface PlayerData extends GamePlayerData {
  hand: HandPlayerData | null;
}

export interface Player extends BaseGamePlayer<GameType.RED_SEVEN> {
  data: PlayerData;
}

export enum CardColor {
  RED = 'RED',
  ORANGE = 'ORANGE',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  INDIGO = 'INDIGO',
  VIOLET = 'VIOLET',
}

export interface Card {
  value: number;
  color: CardColor;
}

export enum MoveType {
  ADD_CARD_TO_PALETTE = 'ADD_CARD_TO_PALETTE',
  ADD_CARD_FROM_HAND_TO_CANVAS = 'ADD_CARD_FROM_HAND_TO_CANVAS',
  ADD_CARD_FROM_PALETTE_TO_CANVAS = 'ADD_CARD_FROM_PALETTE_TO_CANVAS',
  ADD_CARD_TO_DECK = 'ADD_CARD_TO_DECK',
  END_TURN = 'END_TURN',
}

export interface BaseMove {
  isRevertable: boolean;
}

export interface AddCardToPaletteMove extends BaseMove {
  type: MoveType.ADD_CARD_TO_PALETTE;
  cardIndex: number;
  card: Card;
}

export interface AddCardFromHandToCanvasMove extends BaseMove {
  type: MoveType.ADD_CARD_FROM_HAND_TO_CANVAS;
  cardIndex: number;
}

export interface AddCardFromPaletteToCanvasMove extends BaseMove {
  type: MoveType.ADD_CARD_FROM_PALETTE_TO_CANVAS;
  cardIndex: number;
}

export interface AddCardToDeckMove extends BaseMove {
  type: MoveType.ADD_CARD_TO_DECK;
  playerIndex: number;
  cardIndex: number;
}

export interface EndTurnMove extends BaseMove {
  type: MoveType.END_TURN;
  isRevertable: false;
}

export type Move =
  | AddCardToPaletteMove
  | AddCardFromHandToCanvasMove
  | AddCardFromPaletteToCanvasMove
  | AddCardToDeckMove
  | EndTurnMove;

export interface Game {
  players: Player[];
  hand: Hand | null;
}

export interface Hand {
  canvas: Card[];
  deck: Card[];
}

export interface HandPlayerData {
  inPlay: boolean;
  hand: Card[];
  palette: Card[];
}

export interface Turn {
  playedMoves: Move[];
}

export type GameResult = number[];

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface ClientEventMap extends CommonClientEventMap<GameType.RED_SEVEN> {
  [GameClientEventType.PLAY_MOVE]: Move;
  [GameClientEventType.REVERT_LAST_MOVE]: void;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.RED_SEVEN> {}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.RED_SEVEN]: {
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
