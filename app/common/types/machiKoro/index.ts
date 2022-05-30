import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
} from 'common/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {
  DICES_COUNT = 'DICES_COUNT',
  NEED_TO_REROLL = 'NEED_TO_REROLL',
  BUILD_CARD = 'BUILD_CARD',
  BUILD_LANDMARK = 'BUILD_LANDMARK',
  END_TURN = 'END_TURN',
  CHOOSE_PLAYER = 'CHOOSE_PLAYER',
  CARDS_TO_SWAP = 'CARDS_TO_SWAP',
}

export enum EGameServerEvent {
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',

  DICES_ROLL = 'DICES_ROLL',
  CARDS_EFFECTS_RESULTS = 'CARDS_EFFECTS_RESULTS',
  BUILD_CARD = 'BUILD_CARD',
  BUILD_LANDMARK = 'BUILD_LANDMARK',
  CHANGE_ACTIVE_PLAYER_INDEX = 'CHANGE_ACTIVE_PLAYER_INDEX',
  WAIT_ACTION = 'WAIT_ACTION',
  WINNER = 'WINNER',
}

export interface IGameOptions extends ICommonGameOptions {}

export enum EPlayerWaitingAction {
  CHOOSE_DICES_COUNT = 'CHOOSE_DICES_COUNT',
  CHOOSE_NEED_TO_REROLL = 'CHOOSE_NEED_TO_REROLL',
  CHOOSE_PLAYER = 'CHOOSE_PLAYER',
  CHOOSE_CARDS_TO_SWAP = 'CHOOSE_CARDS_TO_SWAP',
}

export enum ECardId {
  // red
  CAFE = 'CAFE',
  RESTAURANT = 'RESTAURANT',

  // green
  BAKERY = 'BAKERY',
  CONVENIENCE_STORE = 'CONVENIENCE_STORE',
  CHEESE_FACTORY = 'CHEESE_FACTORY',
  FURNITURE_FACTORY = 'FURNITURE_FACTORY',
  PRODUCE_MARKET = 'PRODUCE_MARKET',

  // blue
  WHEAT_FIELD = 'WHEAT_FIELD',
  LIVESTOCK_FARM = 'LIVESTOCK_FARM',
  FOREST = 'FOREST',
  MINE = 'MINE',
  APPLE_ORCHARD = 'APPLE_ORCHARD',

  // purple
  STADIUM = 'STADIUM',
  TV_STATION = 'TV_STATION',
  BUSINESS_COMPLEX = 'BUSINESS_COMPLEX',
}

export enum ELandmarkId {
  TRAIN_STATION = 'TRAIN_STATION',
  SHOPPING_MALL = 'SHOPPING_MALL',
  AMUSEMENT_PARK = 'AMUSEMENT_PARK',
  RADIO_TOWER = 'RADIO_TOWER',
}

export enum ECardColor {
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  PURPLE = 'PURPLE',
}

export enum ECardType {
  RESTAURANT = 'RESTAURANT',
  SHOP = 'SHOP',
  FACTORY = 'FACTORY',
  MARKET = 'MARKET',
  WHEAT = 'WHEAT',
  FARM = 'FARM',
  GEAR = 'GEAR',
  MAJOR = 'MAJOR',
}

export interface ICard {
  id: ECardId;
  color: ECardColor;
  type: ECardType;
  cost: number;
  dice: number[];
  count: number;
}

export interface ILandmarkCard {
  id: ELandmarkId;
  cost: number;
}

export interface IPlayerData {
  coins: number;
  cardsIds: ECardId[];
  landmarksIds: ELandmarkId[];
  waitingAction: EPlayerWaitingAction | null;
}

export interface IPlayer extends IGamePlayer {
  data: IPlayerData;
}

export interface IGame {
  activePlayerIndex: number;
  players: IPlayer[];
  board: ECardId[];
  dices: number[];
  winner: string | null;
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.MACHI_KORO> {
  [EGameClientEvent.DICES_COUNT]: number;
  [EGameClientEvent.NEED_TO_REROLL]: boolean;
  [EGameClientEvent.BUILD_CARD]: ECardId;
  [EGameClientEvent.BUILD_LANDMARK]: ELandmarkId;
  [EGameClientEvent.END_TURN]: undefined;
  [EGameClientEvent.CHOOSE_PLAYER]: number;
  [EGameClientEvent.CARDS_TO_SWAP]: {
    from: {
      cardId: ECardId;
      playerIndex: number;
    };
    toCardId: ECardId;
  };
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.MACHI_KORO> {
  [EGameServerEvent.UPDATE_PLAYERS]: IPlayer[];

  [EGameServerEvent.DICES_ROLL]: number[];
  [EGameServerEvent.CARDS_EFFECTS_RESULTS]: {
    players: IPlayer[];
  };
  [EGameServerEvent.BUILD_CARD]: {
    players: IPlayer[];
    board: ECardId[];
  };
  [EGameServerEvent.BUILD_LANDMARK]: {
    players: IPlayer[];
  };
  [EGameServerEvent.CHANGE_ACTIVE_PLAYER_INDEX]: {
    index: number;
  };
  [EGameServerEvent.WAIT_ACTION]: {
    players: IPlayer[];
  };
  [EGameServerEvent.WINNER]: string;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.MACHI_KORO]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
    };
  }
}
