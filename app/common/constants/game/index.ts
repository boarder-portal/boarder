import { DEFAULT_PLAYER_SETTINGS as MAHJONG_PLAYER_SETTINGS } from 'common/constants/games/mahjong';

import { GameType, PlayerSettings, TestCaseType } from 'common/types/game';
import { TestCaseType as MahjongTestCaseType } from 'common/types/games/mahjong';

export const DEFAULT_USE_BOTS = false;
export const DEFAULT_DESTROY_ON_LEAVE = true;

export const GAME_NAMES: Record<GameType, string> = {
  [GameType.PEXESO]: 'Pexeso',
  [GameType.SURVIVAL_ONLINE]: 'Выживать онлайн',
  [GameType.SET]: 'Сет',
  [GameType.ONITAMA]: 'Онитама',
  [GameType.CARCASSONNE]: 'Каркассон',
  [GameType.SEVEN_WONDERS]: 'Семь чудес',
  [GameType.HEARTS]: 'Червы',
  [GameType.BOMBERS]: 'Бомберы',
  [GameType.MACHI_KORO]: 'Machi Koro',
  [GameType.MAHJONG]: 'Маджонг',
  [GameType.RED_SEVEN]: 'Red 7',
};

export const PLAYER_SETTINGS: {
  [Game in GameType]: PlayerSettings<Game>;
} = {
  [GameType.PEXESO]: {},
  [GameType.SURVIVAL_ONLINE]: {},
  [GameType.SET]: {},
  [GameType.ONITAMA]: {},
  [GameType.CARCASSONNE]: {},
  [GameType.SEVEN_WONDERS]: {},
  [GameType.HEARTS]: {},
  [GameType.BOMBERS]: {},
  [GameType.MACHI_KORO]: {},
  [GameType.MAHJONG]: MAHJONG_PLAYER_SETTINGS,
  [GameType.RED_SEVEN]: {},
};

export const TEST_CASES: {
  [Game in GameType]?: Record<string, TestCaseType<Game>>;
} = {
  [GameType.MAHJONG]: MahjongTestCaseType,
};

export const BOTS_SUPPORTED_GAMES = [GameType.SEVEN_WONDERS, GameType.HEARTS, GameType.MAHJONG] as const;

export const GAMES_IN_DEVELOPMENT: GameType[] = [GameType.RED_SEVEN];
