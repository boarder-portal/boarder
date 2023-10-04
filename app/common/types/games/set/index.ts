import {
  BaseGameOptions,
  BaseGamePlayer,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonGameEventMap,
  CommonServerEventMap,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  SEND_SET = 'SEND_SET',
  SEND_NO_SET = 'SEND_NO_SET',
}

export interface GameOptions extends BaseGameOptions<GameType.SET> {}

export interface PlayerData {
  score: number;
}

export interface Player extends BaseGamePlayer<GameType.SET> {
  data: PlayerData;
}

export enum CardColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
}

export enum CardFill {
  EMPTY = 'empty',
  STRIPED = 'striped',
  FILLED = 'filled',
}

export enum CardShape {
  WAVE = 'wave',
  OVAL = 'oval',
  RHOMBUS = 'rhombus',
}

export interface Card {
  count: number;
  color: CardColor;
  fill: CardFill;
  shape: CardShape;
}

export interface Game {
  players: Player[];
  cards: Card[];
}

export type GameResult = number[];

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface GameEventMap extends CommonGameEventMap<GameType.SET> {}

export interface SendSetEvent {
  cardsIndexes: number[];
}

export interface ClientEventMap extends CommonClientEventMap<GameType.SET> {
  [GameClientEventType.SEND_SET]: SendSetEvent;
  [GameClientEventType.SEND_NO_SET]: undefined;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.SET> {}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.SET]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: GameOptions;
      info: Game;
      result: GameResult;
      playerSettings: PlayerSettings;
      testCaseType: TestCaseType;
      gameEventMap: GameEventMap;
    };
  }
}
