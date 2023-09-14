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
  MOVE_PLAYER = 'MOVE_PLAYER',
}

export enum GameServerEventType {
  UPDATE_GAME = 'UPDATE_GAME',
}

export interface GameOptions extends BaseGameOptions<GameType.SURVIVAL_ONLINE> {}

export interface PlayerData {
  cell: CellWithObject<PlayerObject>;
}

export interface Player extends BaseGamePlayer<GameType.SURVIVAL_ONLINE> {
  data: PlayerData;
}

export enum BiomeType {
  GRASS = 'GRASS',
}

export enum ObjectType {
  BASE = 'BASE',
  PLAYER = 'PLAYER',
  ZOMBIE = 'ZOMBIE',
  TREE = 'TREE',
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface BaseMapObject {
  type: ObjectType;
}

export interface BaseObject extends BaseMapObject {
  type: ObjectType.BASE;
}

export interface PlayerObject extends BaseMapObject {
  type: ObjectType.PLAYER;
  index: number;
  direction: Direction;
}

export interface ZombieObject extends BaseMapObject {
  type: ObjectType.ZOMBIE;
  direction: Direction;
}

export interface TreeObject extends BaseMapObject {
  type: ObjectType.TREE;
}

export type MapObject = BaseObject | PlayerObject | ZombieObject | TreeObject;

export interface Cell<Obj extends MapObject = MapObject> {
  x: number;
  y: number;
  biome: BiomeType;
  object: Obj | null;
}

export interface CellWithObject<Obj extends MapObject = MapObject> extends Cell<Obj> {
  object: Obj;
}

export type Map = Cell[][];

export interface Game {
  map: Map;
  players: Player[];
}

export type GameResult = void;

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface GameEventMap extends CommonGameEventMap<GameType.SURVIVAL_ONLINE> {}

export interface UpdateGameEvent {
  players: Player[] | null;
  cells: Cell[];
}

export interface ClientEventMap extends CommonClientEventMap<GameType.SURVIVAL_ONLINE> {
  [GameClientEventType.MOVE_PLAYER]: Direction;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.SURVIVAL_ONLINE> {
  [GameServerEventType.UPDATE_GAME]: UpdateGameEvent;
}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.SURVIVAL_ONLINE]: {
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
