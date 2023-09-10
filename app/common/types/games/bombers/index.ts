import {
  BaseGameOptions,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonServerEventMap,
  Coords,
  GamePlayer,
  Timestamp,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  START_MOVING = 'START_MOVING',
  STOP_MOVING = 'STOP_MOVING',
  PLACE_BOMB = 'PLACE_BOMB',
  HEAL = 'HEAL',
  ACTIVATE_BUFF = 'ACTIVATE_BUFF',
}

export enum GameServerEventType {
  CAN_CONTROL = 'CAN_CONTROL',
  SYNC_COORDS = 'SYNC_COORDS',
  PLACE_BOMB = 'PLACE_BOMB',
  BOMBS_EXPLODED = 'BOMBS_EXPLODED',
  WALL_CREATED = 'WALL_CREATED',
  BONUS_CONSUMED = 'BONUS_CONSUMED',
  PLAYER_HEALED = 'PLAYER_HEALED',
  PLAYER_DIED = 'PLAYER_DIED',
  BUFF_ACTIVATED = 'BUFF_ACTIVATED',
  BUFF_DEACTIVATED = 'BUFF_DEACTIVATED',
  WALLS_DESTROYED = 'WALLS_DESTROYED',
}

export interface GameOptions extends BaseGameOptions {
  mapType: MapType | null;
  withAbilities: boolean;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum Line {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}

export enum PlayerColor {
  DODGERBLUE = 'DODGERBLUE',
  ORANGE = 'ORANGE',
  RED = 'RED',
  MAGENTA = 'MAGENTA',
}

export interface PlayerData {
  color: PlayerColor;
  coords: Coords;
  direction: Direction;
  startMovingTimestamp: Timestamp | null;
  speed: number;
  speedReserve: number;
  maxBombCount: number;
  maxBombCountReserve: number;
  bombRange: number;
  bombRangeReserve: number;
  hp: number;
  hpReserve: number;
  buffs: Buff[];
}

export interface Player extends GamePlayer<GameType.BOMBERS> {
  data: PlayerData;
}

export interface GameResult {
  winner: number | null;
}

export enum ObjectType {
  BOX = 'BOX',
  WALL = 'WALL',
  BOMB = 'BOMB',
  BONUS = 'BONUS',
}

export enum BonusType {
  SPEED = 'SPEED',
  BOMB_COUNT = 'BOMB_COUNT',
  BOMB_RANGE = 'BOMB_RANGE',
  HP = 'HP',
}

export enum BuffType {
  SUPER_SPEED = 'SUPER_SPEED',
  SUPER_BOMB = 'SUPER_BOMB',
  SUPER_RANGE = 'SUPER_RANGE',
  INVINCIBILITY = 'INVINCIBILITY',
  BOMB_INVINCIBILITY = 'BOMB_INVINCIBILITY',
}

export interface Buff {
  type: BuffType;
  endsAt: Timestamp;
}

export interface Box {
  type: ObjectType.BOX;
  id: number;
}

export interface Wall {
  type: ObjectType.WALL;
  id: number;
}

export interface Bomb {
  type: ObjectType.BOMB;
  id: number;
  range: number;
  isSuperBomb: boolean;
  isSuperRange: boolean;
  explodesAt: Timestamp;
}

export interface Bonus {
  type: ObjectType.BONUS;
  id: number;
  bonusType: BonusType;
}

export type MapObject = Box | Wall | Bomb | Bonus;

export interface Cell {
  x: number;
  y: number;
  objects: MapObject[];
}

export type Map = Cell[][];

export enum MapType {
  CHESS = 'CHESS',
  HALL = 'HALL',
  BUG = 'BUG',
  BUNKER = 'BUNKER',
  TURTLE = 'TURTLE',
  CABINET = 'CABINET',
  RACE = 'RACE',
  WAVE = 'WAVE',
  SIGHT = 'SIGHT',
  FIELD = 'FIELD',
  SUNFLOWER = 'SUNFLOWER',
  MEMBRANE = 'MEMBRANE',
  BUTTERFLY = 'BUTTERFLY',
  SIEGE = 'SIEGE',
  CRAB = 'CRAB',
}

export interface Game {
  players: Player[];
  map: Map;
  mapType: MapType;
  startsAt: Timestamp;
  canControl: boolean;
}

export interface SyncCoordsEvent {
  playerIndex: number;
  direction: Direction;
  startMovingTimestamp: Timestamp | null;
  coords: Coords;
}

export interface PlaceBombEvent {
  coords: Coords;
  bomb: Bomb;
}

export interface ExplodedBox {
  id: number;
  coords: Coords;
  bonuses: Bonus[];
}

export interface DestroyedWall {
  id: number;
  coords: Coords;
}

export interface ExplodedBomb {
  id: number;
  coords: Coords;
  explodedDirections: ExplodedDirections;
}

export interface ExplodedDirection {
  start: Coords;
  end: Coords;
}

export type ExplodedDirections = Record<Line, ExplodedDirection>;

export interface HitPlayer {
  index: number;
  damage: number;
}

export interface BombsExplodedEvent {
  bombs: ExplodedBomb[];
  hitPlayers: HitPlayer[];
  explodedBoxes: ExplodedBox[];
  destroyedWalls: DestroyedWall[];
}

export interface WallCreatedEvent {
  coords: Coords;
  wall: Wall;
  deadPlayers: number[];
}

export interface BonusConsumedEvent {
  id: number;
  coords: Coords;
  playerIndex: number;
}

export interface BuffActivatedEvent {
  playerIndex: number;
  buff: Buff;
}

export interface BuffDeactivatedEvent {
  playerIndex: number;
  type: BuffType;
}

export interface ClientEventMap extends CommonClientEventMap<GameType.BOMBERS> {
  [GameClientEventType.START_MOVING]: Direction;
  [GameClientEventType.STOP_MOVING]: undefined;
  [GameClientEventType.PLACE_BOMB]: undefined;
  [GameClientEventType.HEAL]: undefined;
  [GameClientEventType.ACTIVATE_BUFF]: BuffType;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.BOMBERS> {
  [GameServerEventType.CAN_CONTROL]: boolean;
  [GameServerEventType.SYNC_COORDS]: SyncCoordsEvent;
  [GameServerEventType.PLACE_BOMB]: PlaceBombEvent;
  [GameServerEventType.BOMBS_EXPLODED]: BombsExplodedEvent;
  [GameServerEventType.WALL_CREATED]: WallCreatedEvent;
  [GameServerEventType.BONUS_CONSUMED]: BonusConsumedEvent;
  [GameServerEventType.PLAYER_HEALED]: number;
  [GameServerEventType.PLAYER_DIED]: number;
  [GameServerEventType.BUFF_ACTIVATED]: BuffActivatedEvent;
  [GameServerEventType.BUFF_DEACTIVATED]: BuffDeactivatedEvent;
  [GameServerEventType.WALLS_DESTROYED]: DestroyedWall[];
}

type BombersGameOptions = GameOptions;
type BombersGameResult = GameResult;

declare module 'common/types/game' {
  interface GamesParams {
    [GameType.BOMBERS]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: BombersGameOptions;
      info: Game;
      result: BombersGameResult;
      playerSettings: BasePlayerSettings;
    };
  }
}