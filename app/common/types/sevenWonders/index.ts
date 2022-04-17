import { IGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ISevenWondersBuildCardEffect, TSevenWondersEffect } from 'common/types/sevenWonders/effects';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

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

export interface ISevenWondersGameOptions extends IGameOptions {}

export enum ESevenWondersCity {
  RHODOS = 'RHODOS',
  ALEXANDRIA = 'ALEXANDRIA',
  EPHESOS = 'EPHESOS',
  BABYLON = 'BABYLON',
  OLYMPIA = 'OLYMPIA',
  HALIKARNASSOS = 'HALIKARNASSOS',
  GIZAH = 'GIZAH',
  // leaders
  ROMA = 'ROMA',
}

export interface ISevenWondersWonder {
  price: ISevenWondersPrice;
  effects: TSevenWondersEffect[];
}

export interface ISevenWondersCitySide {
  effects: TSevenWondersEffect[];
  wonders: ISevenWondersWonder[];
}

export interface ISevenWondersCity {
  sides: ISevenWondersCitySide[];
}

export interface ISevenWondersBuiltStage {
  index: number;
  card: ISevenWondersCard;
  cardType: number | 'leader';
}

export enum ESevenWondersWaitingActionType {
  PICK_LEADER = 'PICK_LEADER',
  RECRUIT_LEADER = 'RECRUIT_LEADER',
  BUILD_CARD = 'BUILD_CARD',
  EFFECT_BUILD_CARD = 'EFFECT_BUILD_CARD',
}

export interface ISevenWondersWaitingPickLeaderAction {
  type: ESevenWondersWaitingActionType.PICK_LEADER;
}

export interface ISevenWondersWaitingRecruitLeaderAction {
  type: ESevenWondersWaitingActionType.RECRUIT_LEADER;
}

export interface ISevenWondersWaitingBuildCardAction {
  type: ESevenWondersWaitingActionType.BUILD_CARD;
}

export interface ISevenWondersWaitingEffectBuildCardAction {
  type: ESevenWondersWaitingActionType.EFFECT_BUILD_CARD;
  buildEffectIndex: number;
}

export type TSevenWondersWaitingAction =
  | ISevenWondersWaitingPickLeaderAction
  | ISevenWondersWaitingRecruitLeaderAction
  | ISevenWondersWaitingBuildCardAction
  | ISevenWondersWaitingEffectBuildCardAction;

export interface ISevenWondersPlayer extends IPlayer {
  points: number;
  builtCards: ISevenWondersCard[];
  hand: ISevenWondersCard[];
  city: ESevenWondersCity;
  citySide: number;
  builtStages: ISevenWondersBuiltStage[];
  coins: number;
  receivedCoinsDuringTurn: number;
  victoryPoints: number[];
  defeatPoints: number[];
  isBot: boolean;
  chosenActionEvent: ISevenWondersExecuteActionEvent | null;
  waitingForAction: TSevenWondersWaitingAction | null;
  buildCardEffects: ISevenWondersBuildCardEffect[];
  leadersHand: ISevenWondersCard[];
  leadersPool: ISevenWondersCard[];
  copiedCard: ISevenWondersCard | null;
}

export interface ISevenWondersGameInfoEvent {
  players: ISevenWondersPlayer[];
  discard: ISevenWondersCard[];
  age: number;
  phase: ESevenWondersGamePhase;
}

export enum ESevenWondersCardActionType {
  BUILD_STRUCTURE = 'BUILD_STRUCTURE',
  BUILD_WONDER_STAGE = 'BUILD_WONDER_STAGE',
  DISCARD = 'DISCARD',
  PICK_LEADER = 'PICK_LEADER',
}

export interface ISevenWondersBuildingBuildType {
  type: EBuildType.FREE_BY_BUILDING;
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
  freeBuildType: TSevenWondersBuildType | null;
  copiedCard?: ISevenWondersCard;
  discount?: number;
}

export interface ISevenWondersBuildWonderStageAction {
  type: ESevenWondersCardActionType.BUILD_WONDER_STAGE;
  stageIndex: number;
}

export interface ISevenWondersDiscardAction {
  type: ESevenWondersCardActionType.DISCARD;
}

export interface ISevenWondersPickLeaderAction {
  type: ESevenWondersCardActionType.PICK_LEADER;
}

export type TSevenWondersAction = (
  | ISevenWondersBuildStructureAction
  | ISevenWondersBuildWonderStageAction
  | ISevenWondersDiscardAction
  | ISevenWondersPickLeaderAction
);

export type TSevenWondersPayments = Record<ESevenWondersNeighborSide | 'bank', number>;

export interface ISevenWondersExecuteActionEvent {
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

export type TSevenWondersResourceOwner = ESevenWondersNeighborSide | 'own' | 'bank';

export enum ESevenWondersGamePhase {
  DRAFT_LEADERS = 'DRAFT_LEADERS',
  RECRUIT_LEADERS = 'RECRUIT_LEADERS',
  BUILD_STRUCTURES = 'BUILD_STRUCTURES',
}
