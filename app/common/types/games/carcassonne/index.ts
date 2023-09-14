import {
  BaseGameOptions,
  BaseGamePlayer,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonGameEventMap,
  CommonServerEventMap,
  Coords,
  Timestamp,
} from 'common/types';
import { GameType } from 'common/types/game';

export enum GameClientEventType {
  ATTACH_CARD = 'ATTACH_CARD',
}

export enum CardObjectType {
  CITY = 'CITY',
  ROAD = 'ROAD',
  FIELD = 'FIELD',
  MONASTERY = 'MONASTERY',
}

export enum CityGoodsType {
  WHEAT = 'WHEAT',
  FABRIC = 'FABRIC',
  WINE = 'WINE',
}

export enum MeepleType {
  COMMON = 'COMMON',
  FAT = 'FAT',
  BUILDER = 'BUILDER',
  PIG = 'PIG',
}

export enum PlayerColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  BLACK = 'BLACK',
  YELLOW = 'YELLOW',
}

export interface BaseCardObject {
  type: CardObjectType;
  meepleCoords: Coords;
}

export interface CardCity extends BaseCardObject {
  type: CardObjectType.CITY;
  sideParts: number[];
  shields?: number;
  cathedral?: true;
  goods?: CityGoodsType;
}

export interface CardField extends BaseCardObject {
  type: CardObjectType.FIELD;
  sideParts: number[];
  cities?: number[];
}

export interface CardRoad extends BaseCardObject {
  type: CardObjectType.ROAD;
  sideParts: number[];
  inn?: true;
}

export interface CardMonastery extends BaseCardObject {
  type: CardObjectType.MONASTERY;
}

export type CardObject = CardCity | CardField | CardRoad | CardMonastery;

export interface Card {
  id: number;
  count: number;
  objects: CardObject[];
}

export interface PlayerMeeple {
  playerIndex: number;
  type: MeepleType;
}

export interface BaseGameObject {
  id: number;
  type: CardObjectType;
  cards: Coords[];
  meeples: PlayerMeeple[];
}

export interface GameCity extends BaseGameObject {
  type: CardObjectType.CITY;
  shields: number;
  cathedral: boolean;
  goods: Partial<Record<CityGoodsType, number>>;
  isFinished: boolean;
}

export interface GameField extends BaseGameObject {
  type: CardObjectType.FIELD;
  cities: number[];
}

export interface GameRoad extends BaseGameObject {
  type: CardObjectType.ROAD;
  inn: boolean;
  isFinished: boolean;
}

export interface GameMonastery extends BaseGameObject {
  type: CardObjectType.MONASTERY;
}

export type GameObject = GameCity | GameField | GameRoad | GameMonastery;

export type Objects = Partial<Record<number, GameObject>>;

export interface GameCard extends Coords {
  id: number;
  rotation: number;
  objectsBySideParts: number[];
  monasteryId: number | null;
  meeple: GamePlacedMeeple | null;
}

export type Board = Partial<Record<number, Partial<Record<number, GameCard>>>>;

export interface GameOptions extends BaseGameOptions<GameType.CARCASSONNE> {
  withTimer: boolean;
}

export interface ObjectScore {
  objectId: number;
  score: number;
}

export interface GoodsScore {
  goods: CityGoodsType;
  score: number;
}

export type Score = ObjectScore | GoodsScore;

export interface PlayerData {
  color: PlayerColor;
  score: Score[];
  cards: Card[];
  meeples: Record<MeepleType, number>;
  goods: Record<CityGoodsType, number>;
  lastMoves: Coords[];
}

export interface Player extends BaseGamePlayer<GameType.CARCASSONNE> {
  data: PlayerData;
}

export interface PlacedMeeple {
  type: MeepleType;
  cardObjectId: number;
}

export interface GamePlacedMeeple extends PlacedMeeple {
  playerIndex: number;
  gameObjectId: number;
}

export interface Game {
  players: Player[];
  activePlayerIndex: number;
  board: Board;
  objects: Objects;
  cardsLeft: number;
  turn: Turn | null;
}

export type GameResult = void;

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface GameEventMap extends CommonGameEventMap<GameType.CARCASSONNE> {}

export interface Turn {
  endsAt: Timestamp;
}

export interface AttachCardEvent {
  cardIndex: number;
  coords: Coords;
  rotation: number;
  meeple: PlacedMeeple | null;
}

export interface ClientEventMap extends CommonClientEventMap<GameType.CARCASSONNE> {
  [GameClientEventType.ATTACH_CARD]: AttachCardEvent;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.CARCASSONNE> {}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.CARCASSONNE]: {
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
