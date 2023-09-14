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
  DICES_COUNT = 'DICES_COUNT',
  NEED_TO_REROLL = 'NEED_TO_REROLL',
  BUILD_CARD = 'BUILD_CARD',
  BUILD_LANDMARK = 'BUILD_LANDMARK',
  END_TURN = 'END_TURN',
  CHOOSE_PLAYER = 'CHOOSE_PLAYER',
  CARDS_TO_SWAP = 'CARDS_TO_SWAP',
  PUBLISHER_TARGET = 'PUBLISHER_TARGET',
  NEED_TO_USE_HARBOR = 'NEED_TO_USE_HARBOR',
}

export enum GameServerEventType {
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',

  DICES_ROLL = 'DICES_ROLL',
  CARDS_EFFECTS_RESULTS = 'CARDS_EFFECTS_RESULTS',
  BUILD_CARD = 'BUILD_CARD',
  BUILD_LANDMARK = 'BUILD_LANDMARK',
  CHANGE_ACTIVE_PLAYER_INDEX = 'CHANGE_ACTIVE_PLAYER_INDEX',
  WAIT_ACTION = 'WAIT_ACTION',
  HARBOR_EFFECT = 'HARBOR_EFFECT',
}

export interface GameOptions extends BaseGameOptions<GameType.MACHI_KORO> {}

export enum PlayerWaitingActionType {
  CHOOSE_DICES_COUNT = 'CHOOSE_DICES_COUNT',
  CHOOSE_NEED_TO_REROLL = 'CHOOSE_NEED_TO_REROLL',
  CHOOSE_PLAYER = 'CHOOSE_PLAYER',
  CHOOSE_CARDS_TO_SWAP = 'CHOOSE_CARDS_TO_SWAP',
  CHOOSE_PUBLISHER_TARGET = 'CHOOSE_PUBLISHER_TARGET',
  CHOOSE_NEED_TO_USE_HARBOR = 'CHOOSE_NEED_TO_USE_HARBOR',
}

export enum CardId {
  // red
  CAFE = 'CAFE',
  RESTAURANT = 'RESTAURANT',
  SUSHI_BAR = 'SUSHI_BAR',
  PIZZA_JOINT = 'PIZZA_JOINT',
  HAMBURGER_STAND = 'HAMBURGER_STAND',

  // green
  BAKERY = 'BAKERY',
  CONVENIENCE_STORE = 'CONVENIENCE_STORE',
  CHEESE_FACTORY = 'CHEESE_FACTORY',
  FURNITURE_FACTORY = 'FURNITURE_FACTORY',
  PRODUCE_MARKET = 'PRODUCE_MARKET',
  FLOWER_SHOP = 'FLOWER_SHOP',
  FOOD_WAREHOUSE = 'FOOD_WAREHOUSE',

  // blue
  WHEAT_FIELD = 'WHEAT_FIELD',
  LIVESTOCK_FARM = 'LIVESTOCK_FARM',
  FOREST = 'FOREST',
  MINE = 'MINE',
  APPLE_ORCHARD = 'APPLE_ORCHARD',
  FLOWER_GARDEN = 'FLOWER_GARDEN',
  MACKEREL_BOAT = 'MACKEREL_BOAT',
  TUNA_BOAT = 'TUNA_BOAT',

  // purple
  STADIUM = 'STADIUM',
  TV_STATION = 'TV_STATION',
  BUSINESS_COMPLEX = 'BUSINESS_COMPLEX',
  PUBLISHER = 'PUBLISHER',
  TAX_OFFICE = 'TAX_OFFICE',
}

export enum LandmarkId {
  CITY_HALL = 'CITY_HALL',
  HARBOR = 'HARBOR',
  TRAIN_STATION = 'TRAIN_STATION',
  SHOPPING_MALL = 'SHOPPING_MALL',
  AMUSEMENT_PARK = 'AMUSEMENT_PARK',
  RADIO_TOWER = 'RADIO_TOWER',
  AIRPORT = 'AIRPORT',
}

export enum CardColor {
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  PURPLE = 'PURPLE',
}

export enum CardType {
  RESTAURANT = 'RESTAURANT',
  SHOP = 'SHOP',
  FACTORY = 'FACTORY',
  MARKET = 'MARKET',
  WHEAT = 'WHEAT',
  FARM = 'FARM',
  GEAR = 'GEAR',
  BOAT = 'BOAT',
  MAJOR = 'MAJOR',
}

export interface Card {
  id: CardId;
  color: CardColor;
  type: CardType;
  cost: number;
  dice: number[];
  count: number;
}

export interface LandmarkCard {
  id: LandmarkId;
  cost: number;
}

export interface PlayerData {
  coins: number;
  cardsIds: CardId[];
  landmarksIds: LandmarkId[];
}

export interface Player extends BaseGamePlayer<GameType.MACHI_KORO> {
  data: PlayerData;
}

export interface Turn {
  dices: number[];
  withHarborEffect: boolean;
  waitingAction: PlayerWaitingActionType | null;
}

export interface Game {
  activePlayerIndex: number;
  players: Player[];
  board: CardId[];
  turn: Turn | null;
}

export type GameResult = number;

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface GameEventMap extends CommonGameEventMap<GameType.MACHI_KORO> {}

export interface ClientEventMap extends CommonClientEventMap<GameType.MACHI_KORO> {
  [GameClientEventType.DICES_COUNT]: number;
  [GameClientEventType.NEED_TO_REROLL]: boolean;
  [GameClientEventType.BUILD_CARD]: CardId;
  [GameClientEventType.BUILD_LANDMARK]: LandmarkId;
  [GameClientEventType.END_TURN]: undefined;
  [GameClientEventType.CHOOSE_PLAYER]: number;
  [GameClientEventType.CARDS_TO_SWAP]: {
    from: {
      cardId: CardId;
      playerIndex: number;
    };
    toCardId: CardId;
  };
  [GameClientEventType.PUBLISHER_TARGET]: CardType.RESTAURANT | CardType.SHOP;
  [GameClientEventType.NEED_TO_USE_HARBOR]: boolean;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.MACHI_KORO> {
  [GameServerEventType.UPDATE_PLAYERS]: Player[];

  [GameServerEventType.DICES_ROLL]: number[];
  [GameServerEventType.CARDS_EFFECTS_RESULTS]: {
    players: Player[];
  };
  [GameServerEventType.BUILD_CARD]: {
    players: Player[];
    board: CardId[];
  };
  [GameServerEventType.BUILD_LANDMARK]: {
    players: Player[];
  };
  [GameServerEventType.CHANGE_ACTIVE_PLAYER_INDEX]: {
    index: number;
  };
  [GameServerEventType.WAIT_ACTION]: PlayerWaitingActionType | null;
  [GameServerEventType.HARBOR_EFFECT]: boolean;
}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.MACHI_KORO]: {
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
