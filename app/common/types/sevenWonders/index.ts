import { IGameOptions as ICommonGameOptions } from 'common/types/room';
import { IGamePlayer as ICommonPlayer } from 'common/types';
import { ICard } from 'common/types/sevenWonders/cards';
import { IBuildCardEffect, TEffect } from 'common/types/sevenWonders/effects';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { EGame } from 'common/types/game';

export enum EGameEvent {
  GET_GAME_INFO = 'GET_GAME_INFO',
  EXECUTE_ACTION = 'EXECUTE_ACTION',
  CANCEL_ACTION = 'CANCEL_ACTION',

  GAME_INFO = 'GAME_INFO',
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

export interface IPlayer extends ICommonPlayer {
  points: number;
  builtCards: ICard[];
  city: ECity;
  citySide: number;
  builtStages: IWonderBuiltStage[];
  coins: number;
  victoryPoints: number[];
  defeatPoints: number[];
  isBot: boolean;
  leadersHand: ICard[];
  copiedCard: ICard | null;
}

export interface ILeadersDraftPhase extends ILeadersDraft {
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

export interface ILeadersDraft {
  playersData: ILeadersDraftPlayerData[];
  turn: ITurn | null;
}

export interface IAgePlayerData {
  hand: ICard[];
  buildEffects: IBuildCardEffect[];
}

export interface IAge {
  age: number;
  phase: EAgePhase;
  playersData: IAgePlayerData[];
  turn: ITurn | null;
}

export interface ITurnPlayerData {
  receivedCoins: number;
  chosenActionEvent: IExecuteActionEvent | null;
  waitingForAction: TWaitingAction | null;
}

export interface ITurn {
  playersData: ITurnPlayerData[];
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

export type TBuildType =
  | IBuildingBuildType
  | IBuildEffectBuildType;

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

export type TAction = (
  | IBuildStructureAction
  | IBuildWonderStageAction
  | IDiscardAction
  | IPickLeaderAction
);

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

export interface IEventMap {
  [EGameEvent.GET_GAME_INFO]: undefined;
  [EGameEvent.EXECUTE_ACTION]: IExecuteActionEvent;
  [EGameEvent.CANCEL_ACTION]: undefined;

  [EGameEvent.GAME_INFO]: IGame;
}

declare module 'common/types/game' {
  interface IGamesParams {
    [EGame.SEVEN_WONDERS]: {
      event: EGameEvent;
      eventMap: IEventMap;
      options: IGameOptions;
      player: IPlayer;
    };
  }
}
