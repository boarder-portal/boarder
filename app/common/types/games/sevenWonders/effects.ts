import {
  CardActionType,
  NeighborSide,
  PlayerDirection,
  Resource,
  ResourceOwner,
  ScientificSymbolType,
} from 'common/types/games/sevenWonders';
import { CardType } from 'common/types/games/sevenWonders/cards';

export interface Gain {
  points?: number;
  coins?: number;
}

export enum EffectType {
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

export interface GainEffect {
  type: EffectType.GAIN;
  gain: Gain;
}

export interface ResourcesEffect {
  type: EffectType.RESOURCES;
  variants: Resource[];
}

export interface TradeEffect {
  type: EffectType.TRADE;
  sources: ResourceOwner[];
  price: number;
  resources: (CardType.RAW_MATERIAL | CardType.MANUFACTURED_GOODS)[];
}

export interface CardsTypeEffect {
  type: EffectType.CARDS_TYPE;
  cardTypes: CardType[];
  gain: Gain;
  directions: PlayerDirection[];
}

export interface WonderLevelsEffect {
  type: EffectType.WONDER_LEVELS;
  gain: Gain;
  directions: PlayerDirection[];
}

export interface ShieldsEffect {
  type: EffectType.SHIELDS;
  count: number;
}

export interface ScientificSymbolsEffect {
  type: EffectType.SCIENTIFIC_SYMBOLS;
  variants: ScientificSymbolType[];
}

export interface WinsEffect {
  type: EffectType.WINS;
  gain: Gain;
  directions: PlayerDirection[];
}

export interface LossesEffect {
  type: EffectType.LOSSES;
  gain: Gain;
  directions: PlayerDirection[];
}

export interface GainByCoinsEffect {
  type: EffectType.GAIN_BY_COINS;
  count: number;
  gain: Gain;
}

export enum FreeCardPeriodType {
  NOW = 'NOW',
  AGE = 'AGE',
  LAST_AGE_TURN = 'LAST_AGE_TURN',
  ETERNITY = 'ETERNITY',
  LEADER_RECRUITMENT = 'LEADER_RECRUITMENT',
}

export enum FreeCardSourceType {
  HAND = 'HAND',
  DISCARD = 'DISCARD',
  LEADERS = 'LEADERS',
}

export interface BuildCardEffect {
  type: EffectType.BUILD_CARD;
  period: FreeCardPeriodType;
  count?: number;
  cardTypes?: CardType[];
  source: FreeCardSourceType;
  isFree: boolean;
  possibleActions: CardActionType[];
  priority?: number;
}

export interface CopyCardEffect {
  type: EffectType.COPY_CARD;
  neighbors: NeighborSide[];
  cardType: CardType;
}

export interface ReducedPriceEffect {
  type: EffectType.REDUCED_PRICE;
  objectType: CardType | 'wonderLevel';
  discount: {
    coins?: number;
    resources?: number;
  };
  direction: PlayerDirection;
}

export enum CoinPassiveSourceType {
  TRADE = 'TRADE',
  VICTORY_TOKENS = 'VICTORY_TOKENS',
  COMMERCIAL_CARDS = 'COMMERCIAL_CARDS',
  STRUCTURE_INHERITANCE = 'STRUCTURE_INHERITANCE',
}

export interface CoinPassiveEffect {
  type: EffectType.COIN_PASSIVE;
  source: CoinPassiveSourceType;
  count: number;
}

export interface ReturnDefeatsEffect {
  type: EffectType.RETURN_DEFEATS;
}

export interface DrawLeadersEffect {
  type: EffectType.DRAW_LEADERS;
  count: number;
}

export interface ScientificSetEffect {
  type: EffectType.SCIENTIFIC_SET;
  gain: Gain;
}

export type Effect =
  | GainEffect
  | ResourcesEffect
  | TradeEffect
  | CardsTypeEffect
  | WonderLevelsEffect
  | ShieldsEffect
  | ScientificSymbolsEffect
  | WinsEffect
  | LossesEffect
  | GainByCoinsEffect
  | BuildCardEffect
  | CopyCardEffect
  | ReducedPriceEffect
  | CoinPassiveEffect
  | ReturnDefeatsEffect
  | DrawLeadersEffect
  | ScientificSetEffect;
