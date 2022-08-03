import {
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGameOptions as ICommonGameOptions,
  IGamePlayer,
  IPlayerSettings as ICommonPlayerSettings,
} from 'common/types';
import { ICard } from 'common/types/sevenWonders/cards';
import { IBuildCardEffect, TEffect } from 'common/types/sevenWonders/effects';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { EGame } from 'common/types/game';

export enum EGameClientEvent {
  EXECUTE_ACTION = 'EXECUTE_ACTION',
  CANCEL_ACTION = 'CANCEL_ACTION',
}

export enum EScientificSymbol {
  GEAR = 'GEAR',
  COMPASS = 'COMPASS',
  TABLET = 'TABLET',
}

export interface IGameOptions extends ICommonGameOptions {}

export enum ECity {
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

export interface IWonder {
  price: IPrice;
  effects: TEffect[];
}

export interface ICitySide {
  effects: TEffect[];
  wonders: IWonder[];
}

export interface ICity {
  sides: ICitySide[];
}

export interface IWonderBuiltStage {
  index: number;
  card: ICard;
  cardType: number | 'leader';
}

export enum EWaitingActionType {
  PICK_LEADER = 'PICK_LEADER',
  RECRUIT_LEADER = 'RECRUIT_LEADER',
  BUILD_CARD = 'BUILD_CARD',
  EFFECT_BUILD_CARD = 'EFFECT_BUILD_CARD',
}

export interface IWaitingPickLeaderAction {
  type: EWaitingActionType.PICK_LEADER;
}

export interface IWaitingRecruitLeaderAction {
  type: EWaitingActionType.RECRUIT_LEADER;
}

export interface IWaitingBuildCardAction {
  type: EWaitingActionType.BUILD_CARD;
}

export interface IWaitingEffectBuildCardAction {
  type: EWaitingActionType.EFFECT_BUILD_CARD;
  buildEffectIndex: number;
}

export type TWaitingAction =
  | IWaitingPickLeaderAction
  | IWaitingRecruitLeaderAction
  | IWaitingBuildCardAction
  | IWaitingEffectBuildCardAction;

export interface IGamePlayerData {
  points: number;
  builtCards: ICard[];
  city: ECity;
  citySide: number;
  builtStages: IWonderBuiltStage[];
  coins: number;
  victoryPoints: number[];
  defeatPoints: number[];
  leadersHand: ICard[];
  copiedCard: ICard | null;
}

export interface IPlayerData extends IGamePlayerData {
  leadersDraft: ILeadersDraftPlayerData | null;
  age: IAgePlayerData | null;
  turn: ITurnPlayerData | null;
}

export interface IPlayer extends IGamePlayer<EGame.SEVEN_WONDERS> {
  data: IPlayerData;
}

export interface ILeadersDraftPhase {
  type: EGamePhase.DRAFT_LEADERS;
}

export interface IAgePhase extends IAge {
  type: EGamePhase.AGE;
}

export type TGamePhase = ILeadersDraftPhase | IAgePhase;

export interface IGame {
  players: IPlayer[];
  discard: ICard[];
  phase: TGamePhase | null;
}

export interface ILeadersDraftPlayerData {
  pickedLeaders: ICard[];
  leadersPool: ICard[];
}

export interface IAgePlayerData {
  hand: ICard[];
  buildEffects: IBuildCardEffect[];
}

export interface IAge {
  age: number;
  phase: EAgePhase;
}

export interface ITurnPlayerData {
  receivedCoins: number;
  chosenActionEvent: IExecuteActionEvent | null;
  waitingForAction: TWaitingAction | null;
}

export enum ECardActionType {
  BUILD_STRUCTURE = 'BUILD_STRUCTURE',
  BUILD_WONDER_STAGE = 'BUILD_WONDER_STAGE',
  DISCARD = 'DISCARD',
  PICK_LEADER = 'PICK_LEADER',
}

export interface IBuildingBuildType {
  type: EBuildType.FREE_BY_BUILDING;
}

export interface IBuildEffectBuildType {
  type: EBuildType.FREE_WITH_EFFECT;
  effectIndex: number;
}

export type TBuildType = IBuildingBuildType | IBuildEffectBuildType;

export interface IBuildStructureAction {
  type: ECardActionType.BUILD_STRUCTURE;
  freeBuildType: TBuildType | null;
  copiedCard?: ICard;
  discount?: number;
}

export interface IBuildWonderStageAction {
  type: ECardActionType.BUILD_WONDER_STAGE;
  stageIndex: number;
}

export interface IDiscardAction {
  type: ECardActionType.DISCARD;
}

export interface IPickLeaderAction {
  type: ECardActionType.PICK_LEADER;
}

export type TAction = IBuildStructureAction | IBuildWonderStageAction | IDiscardAction | IPickLeaderAction;

export type TPayments = Record<ENeighborSide | 'bank', number>;

export interface IExecuteActionEvent {
  cardIndex: number;
  action: TAction;
  payments?: TPayments;
}

export enum EResource {
  WOOD = 'WOOD',
  ORE = 'ORE',
  CLAY = 'CLAY',
  STONE = 'STONE',

  GLASS = 'GLASS',
  LOOM = 'LOOM',
  PAPYRUS = 'PAPYRUS',
}

export interface IResource {
  type: EResource;
  count: number;
}

export enum ENeighborSide {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum EPlayerDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  SELF = 'SELF',
  ALL = 'ALL',
}

export interface IPrice {
  resources?: IResource[];
  coins?: number;
}

export type TResourceOwner = ENeighborSide | 'own' | 'bank';

export enum EGamePhase {
  DRAFT_LEADERS = 'DRAFT_LEADERS',
  AGE = 'AGE',
}

export enum EAgePhase {
  RECRUIT_LEADERS = 'RECRUIT_LEADERS',
  BUILD_STRUCTURES = 'BUILD_STRUCTURES',
}

export interface IClientEventMap extends ICommonClientEventMap<EGame.SEVEN_WONDERS> {
  [EGameClientEvent.EXECUTE_ACTION]: IExecuteActionEvent;
  [EGameClientEvent.CANCEL_ACTION]: undefined;
}

export interface IServerEventMap extends ICommonServerEventMap<EGame.SEVEN_WONDERS> {}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.SEVEN_WONDERS]: {
      clientEventMap: IClientEventMap;
      serverEventMap: IServerEventMap;
      options: IGameOptions;
      info: IGame;
      result: void;
      playerSettings: ICommonPlayerSettings;
    };
  }
}
