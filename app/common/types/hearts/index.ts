import {
  BaseGameOptions,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
  GamePlayer,
} from 'common/types';
import { Card } from 'common/types/cards';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  CHOOSE_CARD = 'CHOOSE_CARD',
}

export interface GameOptions extends BaseGameOptions {}

export interface GamePlayerData {
  score: number;
}

export interface PlayerData extends GamePlayerData {
  hand: HandPlayerData | null;
  turn: TurnPlayerData | null;
}

export interface Player extends GamePlayer<GameType.HEARTS> {
  data: PlayerData;
}

export interface Game {
  players: Player[];
  passDirection: PassDirection;
  hand: Hand | null;
}

export interface HandPlayerData {
  hand: Card[];
  chosenCardsIndexes: number[];
  takenCards: Card[];
}

export interface Hand {
  stage: HandStage;
  heartsEnteredPlay: boolean;
  turn: Turn | null;
}

export interface TurnPlayerData {
  playedCard: Card | null;
}

export interface Turn {
  startPlayerIndex: number;
  activePlayerIndex: number;
}

export enum HandStage {
  PASS = 'PASS',
  PLAY = 'PLAY',
}

export enum PassDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  ACROSS = 'ACROSS',
  NONE = 'NONE',
}

export interface ClientEventMap extends CommonClientEventMap<GameType.HEARTS> {
  [GameClientEventType.CHOOSE_CARD]: number;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.HEARTS> {}

type HeartsGameOptions = GameOptions;

declare module 'common/types/game' {
  interface GamesParams {
    [GameType.HEARTS]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: HeartsGameOptions;
      info: Game;
      result: void;
      playerSettings: BasePlayerSettings;
    };
  }
}
