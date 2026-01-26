import {
  BaseGameOptions,
  BaseGamePlayer,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonGameEventMap,
  CommonServerEventMap,
} from 'common/types';
import { GameType } from 'common/types/game';
import {
  AbilityCardId,
  BuildingCardId,
  CardId,
  CardWithInventory,
  ObservationCardId,
} from 'common/types/games/outerMinds/cards';
import { Human } from 'common/types/games/outerMinds/common';

export enum GameClientEventType {}

export enum GameServerEventType {}

export interface GameOptions extends BaseGameOptions<GameType.OUTER_MINDS> {}

export interface GamePlayerData {}

export interface PlayerData extends GamePlayerData {
  handDraft: HandDraftPlayerData | null;
  play: PlayPhasePlayerData | null;
}

export interface Player extends BaseGamePlayer<GameType.OUTER_MINDS> {
  data: PlayerData;
}

export interface Game {
  players: Player[];
  phase: GamePhase | null;
}

export enum GamePhaseType {
  HAND_DRAFT = 'HAND_DRAFT',
  PLAY = 'PLAY',
}

export interface HandDraftPhase {
  type: GamePhaseType.HAND_DRAFT;
  deck: CardId[];
  activePlayerIndex: number;
  turn: HandDraftTurn | null;
}

export interface HandDraftTurn {
  cards: CardId[];
}

export interface HandDraftPlayerData {
  pickedCards: CardId[];
}

export interface PlayPhase {
  type: GamePhaseType.PLAY;
  city: CardWithInventory<BuildingCardId>[][];
}

export interface PlayPhasePlayerData {
  hand: CardId[];
  observations: CardWithInventory<ObservationCardId>[];
  abilities: CardWithInventory<AbilityCardId>[];
  humans: Human[];
  energy: number;
  score: number;
}

export type GamePhase = HandDraftPhase | PlayPhase;

export type GameResult = void;

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface GameEventMap extends CommonGameEventMap<GameType.OUTER_MINDS> {}

export interface ClientEventMap extends CommonClientEventMap<GameType.OUTER_MINDS> {}

export interface ServerEventMap extends CommonServerEventMap<GameType.OUTER_MINDS> {}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.OUTER_MINDS]: {
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
