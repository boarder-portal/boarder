import {
  BaseGameOptions,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
  GamePlayer,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {}

export enum GameServerEventType {}

export interface GameOptions extends BaseGameOptions {}

export interface PlayerData {}

export interface Player extends GamePlayer<GameType.RED_SEVEN> {
  data: PlayerData;
}

export interface Game {
  players: Player[];
}

export type GameResult = void;

export interface PlayerSettings extends BasePlayerSettings {}

export interface ClientEventMap extends CommonClientEventMap<GameType.RED_SEVEN> {}

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
    };
  }
}
