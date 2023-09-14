import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import {
  BaseGameOptions,
  BaseGamePlayer,
  BasePlayerSettings,
  CommonClientEventMap,
  CommonGameEventMap,
  CommonServerEventMap,
} from 'common/types';
import { GameType } from 'common/types/game';
import { Card } from 'common/types/games/sevenWonders/cards';
import { BuildCardEffect, Effect } from 'common/types/games/sevenWonders/effects';

export enum GameClientEventType {
  PICK_CITY_SIDE = 'PICK_CITY_SIDE',
  EXECUTE_ACTION = 'EXECUTE_ACTION',
  CANCEL_ACTION = 'CANCEL_ACTION',
}

export enum ScientificSymbolType {
  GEAR = 'GEAR',
  COMPASS = 'COMPASS',
  TABLET = 'TABLET',
}

export interface GameOptions extends BaseGameOptions<GameType.SEVEN_WONDERS> {
  includeLeaders: boolean;
}

export enum CityName {
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

export interface Wonder {
  price: Price;
  effects: Effect[];
  position?: number;
}

export interface CitySide {
  effects: Effect[];
  wonders: Wonder[];
}

export interface City {
  sides: CitySide[];
}

export interface WonderBuiltStage {
  index: number;
  card: Card;
  cardType: number | 'leader';
}

export enum WaitingActionType {
  PICK_LEADER = 'PICK_LEADER',
  RECRUIT_LEADER = 'RECRUIT_LEADER',
  BUILD_CARD = 'BUILD_CARD',
  EFFECT_BUILD_CARD = 'EFFECT_BUILD_CARD',
}

export interface WaitingPickLeaderAction {
  type: WaitingActionType.PICK_LEADER;
}

export interface WaitingRecruitLeaderAction {
  type: WaitingActionType.RECRUIT_LEADER;
}

export interface WaitingBuildCardAction {
  type: WaitingActionType.BUILD_CARD;
}

export interface WaitingEffectBuildCardAction {
  type: WaitingActionType.EFFECT_BUILD_CARD;
  buildEffectIndex: number;
}

export type WaitingAction =
  | WaitingPickLeaderAction
  | WaitingRecruitLeaderAction
  | WaitingBuildCardAction
  | WaitingEffectBuildCardAction;

export interface GamePlayerData {
  points: number;
  builtCards: Card[];
  city: CityName;
  citySide: number;
  builtStages: WonderBuiltStage[];
  coins: number;
  victoryPoints: number[];
  defeatPoints: number[];
  leadersHand: Card[];
  copiedCard: Card | null;
}

export interface PlayerData extends GamePlayerData {
  pickCitySide: PickCitySidePlayerData | null;
  leadersDraft: LeadersDraftPlayerData | null;
  age: AgePlayerData | null;
  turn: TurnPlayerData | null;
}

export interface Player extends BaseGamePlayer<GameType.SEVEN_WONDERS> {
  data: PlayerData;
}

export interface PickCitySidePhase {
  type: GamePhaseType.PICK_CITY_SIDE;
}

export interface LeadersDraftPhase {
  type: GamePhaseType.DRAFT_LEADERS;
}

export interface AgePhase extends Age {
  type: GamePhaseType.AGE;
}

export type GamePhase = PickCitySidePhase | LeadersDraftPhase | AgePhase;

export interface Game {
  players: Player[];
  discard: Card[];
  phase: GamePhase | null;
}

export interface PickCitySidePlayerData {
  city: CityName;
  pickedSide: number | null;
}

export interface LeadersDraftPlayerData {
  pickedLeaders: Card[];
  leadersPool: Card[];
}

export interface AgePlayerData {
  hand: Card[];
  buildEffects: BuildCardEffect[];
}

export interface Age {
  age: number;
  phase: AgePhaseType;
}

export interface TurnPlayerData {
  receivedCoins: number;
  chosenActionEvent: ExecuteActionEvent | null;
  waitingForAction: WaitingAction | null;
}

export enum CardActionType {
  BUILD_STRUCTURE = 'BUILD_STRUCTURE',
  BUILD_WONDER_STAGE = 'BUILD_WONDER_STAGE',
  DISCARD = 'DISCARD',
  PICK_LEADER = 'PICK_LEADER',
}

export interface BuildingBuildType {
  type: BuildKind.FREE_BY_BUILDING;
}

export interface BuildEffectBuildType {
  type: BuildKind.FREE_WITH_EFFECT;
  effectIndex: number;
}

export type BuildType = BuildingBuildType | BuildEffectBuildType;

export interface BuildStructureAction {
  type: CardActionType.BUILD_STRUCTURE;
  freeBuildType: BuildType | null;
  copiedCard?: Card;
  discount?: number;
}

export interface BuildWonderStageAction {
  type: CardActionType.BUILD_WONDER_STAGE;
  stageIndex: number;
}

export interface DiscardAction {
  type: CardActionType.DISCARD;
}

export interface PickLeaderAction {
  type: CardActionType.PICK_LEADER;
}

export type Action = BuildStructureAction | BuildWonderStageAction | DiscardAction | PickLeaderAction;

export type Payments = Record<NeighborSide | 'bank', number>;

export interface ExecuteActionEvent {
  cardIndex: number;
  action: Action;
  payments?: Payments;
}

export enum ResourceType {
  WOOD = 'WOOD',
  ORE = 'ORE',
  CLAY = 'CLAY',
  STONE = 'STONE',

  GLASS = 'GLASS',
  LOOM = 'LOOM',
  PAPYRUS = 'PAPYRUS',
}

export interface Resource {
  type: ResourceType;
  count: number;
}

export enum NeighborSide {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum PlayerDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  SELF = 'SELF',
  ALL = 'ALL',
}

export interface Price {
  resources?: Resource[];
  coins?: number;
}

export type ResourceOwner = NeighborSide | 'own' | 'bank';

export enum GamePhaseType {
  PICK_CITY_SIDE = 'PICK_CITY_SIDE',
  DRAFT_LEADERS = 'DRAFT_LEADERS',
  AGE = 'AGE',
}

export enum AgePhaseType {
  RECRUIT_LEADERS = 'RECRUIT_LEADERS',
  BUILD_STRUCTURES = 'BUILD_STRUCTURES',
}

export type GameResult = void;

export interface PlayerSettings extends BasePlayerSettings {}

export enum TestCaseType {}

export enum GameEventType {}

export interface GameEventMap extends CommonGameEventMap<GameType.SEVEN_WONDERS> {}

export interface ClientEventMap extends CommonClientEventMap<GameType.SEVEN_WONDERS> {
  [GameClientEventType.PICK_CITY_SIDE]: number | null;
  [GameClientEventType.EXECUTE_ACTION]: ExecuteActionEvent;
  [GameClientEventType.CANCEL_ACTION]: undefined;
}

export interface ServerEventMap extends CommonServerEventMap<GameType.SEVEN_WONDERS> {}

declare module 'common/types/game/params' {
  interface GamesParams {
    [GameType.SEVEN_WONDERS]: {
      clientEventMap: ClientEventMap;
      serverEventMap: ServerEventMap;
      options: GameOptions;
      info: Game;
      result: GameResult;
      playerSettings: PlayerSettings;
      testCaseType: TestCaseType;
      gameEventMap: GameEventMap;
    };
  }
}
