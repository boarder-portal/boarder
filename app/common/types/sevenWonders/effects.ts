import {
  ESevenWondersCardType,
  ESevenWondersPlayerDirection,

} from 'common/types/sevenWonders/cards';
import {
  ESevenWondersNeighbor,
  ISevenWondersResource,
  ISevenWondersScientificSymbol,
} from 'common/types/sevenWonders/index';

export interface ISevenWondersGain {
  points?: number;
  coins?: number;
}

export enum ISevenWondersEffect {
  GAIN = 'GAIN',
  RESOURCES = 'RESOURCES',
  TRADE = 'TRADE',
  CARDS_TYPE = 'CARDS_TYPE',
  WONDER_LEVELS = 'WONDER_LEVELS',
  SHIELDS = 'SHIELDS',
  SCIENTIFIC_SYMBOLS = 'SCIENTIFIC_SYMBOLS',
  WINS = 'WINS',
  LOSSES = 'LOSSES',
  BUILD_CARD = 'BUILD_CARD',
  COPY_CARD = 'COPY_CARD',
}

export interface ISevenWondersGainEffect {
  type: ISevenWondersEffect.GAIN;
  gain: ISevenWondersGain;
}

export interface ISevenWondersResourcesEffect {
  type: ISevenWondersEffect.RESOURCES;
  variants: ISevenWondersResource[];
}

export interface ISevenWondersTradeEffect {
  type: ISevenWondersEffect.TRADE;
  neighbors: ESevenWondersNeighbor[];
  price: number;
  resource: ESevenWondersCardType.RAW_MATERIAL | ESevenWondersCardType.MANUFACTURED_GOODS;
}

export interface ISevenWondersCardsTypeEffectSource {
  cardTypes: ESevenWondersCardType[];
  gain: ISevenWondersGain;
}

export interface ISevenWondersCardsTypeEffect {
  type: ISevenWondersEffect.CARDS_TYPE;
  sources: ISevenWondersCardsTypeEffectSource[];
  directions: ESevenWondersPlayerDirection[];
}

export interface ISevenWondersWonderLevelsEffect {
  type: ISevenWondersEffect.WONDER_LEVELS;
  gain: ISevenWondersGain;
  directions: ESevenWondersPlayerDirection[];
}

export interface ISevenWondersShieldsEffect {
  type: ISevenWondersEffect.SHIELDS;
  count: number;
}

export interface ISevenWondersScientificSymbolsEffect {
  type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS;
  variants: ISevenWondersScientificSymbol[];
}

export interface ISevenWondersWinsEffect {
  type: ISevenWondersEffect.WINS;
  gain: ISevenWondersGain;
  directions: ESevenWondersPlayerDirection[];
}

export interface ISevenWondersLossesEffect {
  type: ISevenWondersEffect.LOSSES;
  gain: ISevenWondersGain;
  directions: ESevenWondersPlayerDirection[];
}

export enum ESevenWondersFreeCardPeriod {
  NOW = 'NOW',
  AGE = 'AGE',
  LAST_AGE_TURN = 'LAST_AGE_TURN',
  ETERNITY = 'ETERNITY',
}

export enum ESevenWondersFreeCardSource {
  HAND = 'HAND',
  DISCARD = 'DISCARD',
}

export interface ISevenWondersBuildCardEffect {
  type: ISevenWondersEffect.BUILD_CARD;
  period: ESevenWondersFreeCardPeriod;
  count: number;
  cardTypes: ESevenWondersCardType[];
  source: ESevenWondersFreeCardSource;
  isFree: boolean;
}

export interface ISevenWondersCopyCardEffect {
  type: ISevenWondersEffect.COPY_CARD;
  directions: ESevenWondersPlayerDirection[];
  cardType: ESevenWondersCardType;
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
 | ISevenWondersBuildCardEffect
 | ISevenWondersCopyCardEffect
