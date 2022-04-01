import { ICommonGameOptions } from 'common/types/room';
import { IPlayer } from 'common/types';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { TSevenWondersEffect } from 'common/types/sevenWonders/effects';

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
  waitingForAdditionalAction: boolean;
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

export interface ISevenWondersBuildStructureAction {
  type: ESevenWondersCardActionType.BUILD_STRUCTURE;
  isFree: boolean;
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
