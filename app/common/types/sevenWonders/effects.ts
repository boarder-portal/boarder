import {
  ESevenWondersCardType,
  ESevenWondersPlayerDirection,
} from 'common/types/sevenWonders/cards';
import {
  ESevenWondersCardActionType,
  ESevenWondersNeighborSide,
  ISevenWondersResource,
  ESevenWondersScientificSymbol,
  TSevenWondersResourceOwner,
} from 'common/types/sevenWonders/index';

export interface ISevenWondersGain {
  points?: number;
  coins?: number;
}

export enum ESevenWondersEffect {
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

export interface ISevenWondersGainEffect {
  type: ESevenWondersEffect.GAIN;
  gain: ISevenWondersGain;
}

export interface ISevenWondersResourcesEffect {
  type: ESevenWondersEffect.RESOURCES;
  variants: ISevenWondersResource[];
}

export interface ISevenWondersTradeEffect {
  type: ESevenWondersEffect.TRADE;
  sources: TSevenWondersResourceOwner[];
  price: number;
  resources: (ESevenWondersCardType.RAW_MATERIAL | ESevenWondersCardType.MANUFACTURED_GOODS)[];
}

export interface ISevenWondersCardsTypeEffect {
  type: ESevenWondersEffect.CARDS_TYPE;
  cardTypes: ESevenWondersCardType[];
  gain: ISevenWondersGain;
  directions: ESevenWondersPlayerDirection[];
}

export interface ISevenWondersWonderLevelsEffect {
  type: ESevenWondersEffect.WONDER_LEVELS;
  gain: ISevenWondersGain;
  directions: ESevenWondersPlayerDirection[];
}

export interface ISevenWondersShieldsEffect {
  type: ESevenWondersEffect.SHIELDS;
  count: number;
}

export interface ISevenWondersScientificSymbolsEffect {
  type: ESevenWondersEffect.SCIENTIFIC_SYMBOLS;
  variants: ESevenWondersScientificSymbol[];
}

export interface ISevenWondersWinsEffect {
  type: ESevenWondersEffect.WINS;
  gain: ISevenWondersGain;
  directions: ESevenWondersPlayerDirection[];
}

export interface ISevenWondersLossesEffect {
  type: ESevenWondersEffect.LOSSES;
  gain: ISevenWondersGain;
  directions: ESevenWondersPlayerDirection[];
}

export interface ISevenWondersGainByCoinsEffect {
  type: ESevenWondersEffect.GAIN_BY_COINS;
  count: number;
  gain: ISevenWondersGain;
}

export enum ESevenWondersFreeCardPeriod {
  NOW = 'NOW',
  AGE = 'AGE',
  LAST_AGE_TURN = 'LAST_AGE_TURN',
  ETERNITY = 'ETERNITY',
  LEADER_RECRUITMENT = 'LEADER_RECRUITMENT',
}

export enum ESevenWondersFreeCardSource {
  HAND = 'HAND',
  DISCARD = 'DISCARD',
  LEADERS = 'LEADERS',
}

export interface ISevenWondersBuildCardEffect {
  type: ESevenWondersEffect.BUILD_CARD;
  period: ESevenWondersFreeCardPeriod;
  count: number;
  cardTypes?: ESevenWondersCardType[];
  source: ESevenWondersFreeCardSource;
  isFree: boolean;
  possibleActions: ESevenWondersCardActionType[];
}

export interface ISevenWondersCopyCardEffect {
  type: ESevenWondersEffect.COPY_CARD;
  neighbors: ESevenWondersNeighborSide[];
  cardType: ESevenWondersCardType;
}

export interface ISevenWondersReducedPriceEffect {
  type: ESevenWondersEffect.REDUCED_PRICE;
  objectType: ESevenWondersCardType | 'wonderLevel';
  discount: {
    coins?: number;
    resources?: number;
  };
  direction: ESevenWondersPlayerDirection;
}

export enum ESevenWondersCoinPassiveSource {
  TRADE = 'TRADE',
  VICTORY_TOKENS = 'VICTORY_TOKENS',
  COMMERCIAL_CARDS = 'COMMERCIAL_CARDS',
  STRUCTURE_INHERITANCE = 'STRUCTURE_INHERITANCE',
}

export interface ISevenWondersCoinPassiveEffect {
  type: ESevenWondersEffect.COIN_PASSIVE;
  source: ESevenWondersCoinPassiveSource;
  count: number;
}

export interface ISevenWondersReturnDefeatsEffect {
  type: ESevenWondersEffect.RETURN_DEFEATS;
}

export interface ISevenWondersDrawLeadersEffect {
  type: ESevenWondersEffect.DRAW_LEADERS;
  count: number;
}

export interface ISevenWondersScientificSetEffect {
  type: ESevenWondersEffect.SCIENTIFIC_SET;
  gain: ISevenWondersGain;
}

export type TSevenWondersEffect =
 | ISevenWondersGainEffect
 | ISevenWondersResourcesEffect
 | ISevenWondersTradeEffect
 | ISevenWondersCardsTypeEffect
 | ISevenWondersWonderLevelsEffect
 | ISevenWondersShieldsEffect
 | ISevenWondersScientificSymbolsEffect
 | ISevenWondersWinsEffect
 | ISevenWondersLossesEffect
 | ISevenWondersGainByCoinsEffect
 | ISevenWondersBuildCardEffect
 | ISevenWondersCopyCardEffect
 | ISevenWondersReducedPriceEffect
 | ISevenWondersCoinPassiveEffect
 | ISevenWondersReturnDefeatsEffect
 | ISevenWondersDrawLeadersEffect
 | ISevenWondersScientificSetEffect
