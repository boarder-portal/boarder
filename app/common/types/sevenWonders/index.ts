import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ISevenWondersBuildCardEffect, TSevenWondersEffect } from 'common/types/sevenWonders/effects';

import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';

export enum ESevenWondersGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  EXECUTE_ACTION = 'EXECUTE_ACTION',
  CANCEL_ACTION = 'CANCEL_ACTION',

  GAME_INFO = 'GAME_INFO',
}

export enum ESevenWondersScientificSymbol {
  GEAR = 'GEAR',
  COMPASS = 'COMPASS',
  TABLET = 'TABLET',
}

export interface ISevenWondersGameOptions extends ICommonGameOptions {}

export enum ESevenWondersCity {
  RHODOS = 'RHODOS',
  ALEXANDRIA = 'ALEXANDRIA',
  EPHESOS = 'EPHESOS',
  BABYLON = 'BABYLON',
  OLYMPIA = 'OLYMPIA',
  HALIKARNASSOS = 'HALIKARNASSOS',
  GIZAH = 'GIZAH',
}

export interface ISevenWondersWonder {
  price: ISevenWondersPrice;
  effects: TSevenWondersEffect[];
}

export interface ISevenWondersCitySide {
  effect: TSevenWondersEffect;
  wonders: ISevenWondersWonder[];
}

export interface ISevenWondersCity {
  sides: ISevenWondersCitySide[];
}

export interface ISevenWondersBuiltStage {
  index: number;
  card: ISevenWondersCard;
  cardAge: number;
}

export enum EAdditionalActionType {
  BUILD_FROM_DISCARD = 'BUILD_FROM_DISCARD',
  BUILD_LAST_AGE_CARD = 'BUILD_LAST_AGE_CARD',
}

export interface ISevenWondersPlayer extends IPlayer {
  points: number;
  builtCards: ISevenWondersCard[];
  hand: ISevenWondersCard[];
  city: ESevenWondersCity;
  citySide: number;
  builtStages: ISevenWondersBuiltStage[];
  coins: number;
  victoryPoints: number[];
  defeatPoints: number[];
  isBot: boolean;
  actions: ISevenWondersExecuteActionEvent[];
  waitingAdditionalActionType: EAdditionalActionType | null;
  buildCardEffects: ISevenWondersBuildCardEffect[];
}

export interface ISevenWondersGameInfoEvent {
  players: ISevenWondersPlayer[];
  discard: ISevenWondersCard[];
}

export enum ESevenWondersCardActionType {
  BUILD_STRUCTURE = 'BUILD_STRUCTURE',
  BUILD_WONDER_STAGE = 'BUILD_WONDER_STAGE',
  DISCARD = 'DISCARD',
}

export interface ISevenWondersBuildingBuildType {
  type: EBuildType.FOR_BUILDING;
}

export interface ISevenWondersBuildEffectBuildType {
  type: EBuildType.FREE_WITH_EFFECT;
  effectIndex: number;
}

export type TSevenWondersBuildType =
  | ISevenWondersBuildingBuildType
  | ISevenWondersBuildEffectBuildType;

export interface ISevenWondersBuildStructureAction {
  type: ESevenWondersCardActionType.BUILD_STRUCTURE;
  isFree: boolean;
  freeBuildType: TSevenWondersBuildType | null;
}

export interface ISevenWondersBuildWonderStageAction {
  type: ESevenWondersCardActionType.BUILD_WONDER_STAGE;
  stageIndex: number;
}

export interface ISevenWondersDiscardAction {
  type: ESevenWondersCardActionType.DISCARD;
}

export type TSevenWondersAction = (
  | ISevenWondersBuildStructureAction
  | ISevenWondersBuildWonderStageAction
  | ISevenWondersDiscardAction
);

export type TSevenWondersPayments = Record<ESevenWondersNeighborSide, number>;

export interface ISevenWondersExecuteActionEvent {
  card: ISevenWondersCard;
  cardIndex: number;
  action: TSevenWondersAction;
  payments?: TSevenWondersPayments;
}

export enum ESevenWondersResource {
  WOOD = 'WOOD',
  ORE = 'ORE',
  CLAY = 'CLAY',
  STONE = 'STONE',

  GLASS = 'GLASS',
  LOOM = 'LOOM',
  PAPYRUS = 'PAPYRUS',
}

export interface ISevenWondersResource {
  type: ESevenWondersResource;
  count: number;
}

export enum ESevenWondersNeighborSide {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface ISevenWondersPrice {
  resources?: ISevenWondersResource[];
  coins?: number;
}
