import { ECardType } from 'common/types/sevenWonders/cards';
import {
  ECardActionType,
  ENeighborSide,
  EPlayerDirection,
  EScientificSymbol,
  IResource,
  TResourceOwner,
} from 'common/types/sevenWonders';

export interface IGain {
  points?: number;
  coins?: number;
}

export enum EEffect {
  GAIN = 'GAIN',
  RESOURCES = 'RESOURCES',
  TRADE = 'TRADE',
  CARDS_TYPE = 'CARDS_TYPE',
  WONDER_LEVELS = 'WONDER_LEVELS',
  SHIELDS = 'SHIELDS',
  SCIENTIFIC_SYMBOLS = 'SCIENTIFIC_SYMBOLS',
  WINS = 'WINS',
  LOSSES = 'LOSSES',
  GAIN_BY_COINS = 'GAIN_BY_COINS',
  BUILD_CARD = 'BUILD_CARD',
  COPY_CARD = 'COPY_CARD',
  REDUCED_PRICE = 'REDUCED_PRICE',
  COIN_PASSIVE = 'COIN_PASSIVE',
  RETURN_DEFEATS = 'RETURN_DEFEATS',
  DRAW_LEADERS = 'DRAW_LEADERS',
  SCIENTIFIC_SET = 'SCIENTIFIC_SET',
}

export interface IGainEffect {
  type: EEffect.GAIN;
  gain: IGain;
}

export interface IResourcesEffect {
  type: EEffect.RESOURCES;
  variants: IResource[];
}

export interface ITradeEffect {
  type: EEffect.TRADE;
  sources: TResourceOwner[];
  price: number;
  resources: (ECardType.RAW_MATERIAL | ECardType.MANUFACTURED_GOODS)[];
}

export interface ICardsTypeEffect {
  type: EEffect.CARDS_TYPE;
  cardTypes: ECardType[];
  gain: IGain;
  directions: EPlayerDirection[];
}

export interface IWonderLevelsEffect {
  type: EEffect.WONDER_LEVELS;
  gain: IGain;
  directions: EPlayerDirection[];
}

export interface IShieldsEffect {
  type: EEffect.SHIELDS;
  count: number;
}

export interface IScientificSymbolsEffect {
  type: EEffect.SCIENTIFIC_SYMBOLS;
  variants: EScientificSymbol[];
}

export interface IWinsEffect {
  type: EEffect.WINS;
  gain: IGain;
  directions: EPlayerDirection[];
}

export interface ILossesEffect {
  type: EEffect.LOSSES;
  gain: IGain;
  directions: EPlayerDirection[];
}

export interface IGainByCoinsEffect {
  type: EEffect.GAIN_BY_COINS;
  count: number;
  gain: IGain;
}

export enum EFreeCardPeriod {
  NOW = 'NOW',
  AGE = 'AGE',
  LAST_AGE_TURN = 'LAST_AGE_TURN',
  ETERNITY = 'ETERNITY',
  LEADER_RECRUITMENT = 'LEADER_RECRUITMENT',
}

export enum EFreeCardSource {
  HAND = 'HAND',
  DISCARD = 'DISCARD',
  LEADERS = 'LEADERS',
}

export interface IBuildCardEffect {
  type: EEffect.BUILD_CARD;
  period: EFreeCardPeriod;
  count?: number;
  cardTypes?: ECardType[];
  source: EFreeCardSource;
  isFree: boolean;
  possibleActions: ECardActionType[];
  priority?: number;
}

export interface ICopyCardEffect {
  type: EEffect.COPY_CARD;
  neighbors: ENeighborSide[];
  cardType: ECardType;
}

export interface IReducedPriceEffect {
  type: EEffect.REDUCED_PRICE;
  objectType: ECardType | 'wonderLevel';
  discount: {
    coins?: number;
    resources?: number;
  };
  direction: EPlayerDirection;
}

export enum ECoinPassiveSource {
  TRADE = 'TRADE',
  VICTORY_TOKENS = 'VICTORY_TOKENS',
  COMMERCIAL_CARDS = 'COMMERCIAL_CARDS',
  STRUCTURE_INHERITANCE = 'STRUCTURE_INHERITANCE',
}

export interface ICoinPassiveEffect {
  type: EEffect.COIN_PASSIVE;
  source: ECoinPassiveSource;
  count: number;
}

export interface IReturnDefeatsEffect {
  type: EEffect.RETURN_DEFEATS;
}

export interface IDrawLeadersEffect {
  type: EEffect.DRAW_LEADERS;
  count: number;
}

export interface IScientificSetEffect {
  type: EEffect.SCIENTIFIC_SET;
  gain: IGain;
}

export type TEffect =
 | IGainEffect
 | IResourcesEffect
 | ITradeEffect
 | ICardsTypeEffect
 | IWonderLevelsEffect
 | IShieldsEffect
 | IScientificSymbolsEffect
 | IWinsEffect
 | ILossesEffect
 | IGainByCoinsEffect
 | IBuildCardEffect
 | ICopyCardEffect
 | IReducedPriceEffect
 | ICoinPassiveEffect
 | IReturnDefeatsEffect
 | IDrawLeadersEffect
 | IScientificSetEffect
