import {
  ESevenWondersCardType,
  ESevenWondersPlayerDirection,
} from 'common/types/sevenWonders/cards';
import {
  ESevenWondersNeighborSide,
  ISevenWondersResource,
  ESevenWondersScientificSymbol, ESevenWondersCardActionType,
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
  BUILD_CARD = 'BUILD_CARD',
  COPY_CARD = 'COPY_CARD',
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
  neighbors: ESevenWondersNeighborSide[];
  price: number;
  resource: ESevenWondersCardType.RAW_MATERIAL | ESevenWondersCardType.MANUFACTURED_GOODS;
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
