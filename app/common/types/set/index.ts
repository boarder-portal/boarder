import {
  BaseGameOptions,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
  GamePlayer,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  SEND_SET = 'SEND_SET',
  SEND_NO_SET = 'SEND_NO_SET',
}

export interface GameOptions extends BaseGameOptions {}

export interface PlayerData {
  score: number;
}

export interface Player extends GamePlayer<GameType.SET> {
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
  id: number;
  count: number;
  color: CardColor;
  fill: CardFill;
  shape: CardShape;
}

export interface Game {
  players: Player[];
  cards: Card[];
}

export interface SendSetEvent {
  cardsIds: number[];
}

export interface ClientEventMap extends CommonClientEventMap<GameType.SET> {
  [GameClientEventType.SEND_SET]: SendSetEvent;
  [GameClientEventType.SEND_NO_SET]: undefined;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.SET> {}

type SetGameOptions = GameOptions;

declare module 'common/types/game' {
  interface GamesParams {
    [GameType.SET]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: SetGameOptions;
      info: Game;
      result: number[];
      playerSettings: BasePlayerSettings;
    };
  }
}
