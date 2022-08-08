import { DEFAULT_PLAYER_SETTINGS as MAHJONG_PLAYER_SETTINGS } from 'common/constants/games/mahjong';

import { EGame, TPlayerSettings } from 'common/types/game';

export const GAME_NAMES: Record<EGame, string> = {
  [EGame.PEXESO]: 'Pexeso',
  [EGame.SURVIVAL_ONLINE]: 'Выживать онлайн',
  [EGame.SET]: 'Сет',
  [EGame.ONITAMA]: 'Онитама',
  [EGame.CARCASSONNE]: 'Каркассон',
  [EGame.SEVEN_WONDERS]: 'Семь чудес',
  [EGame.HEARTS]: 'Червы',
  [EGame.BOMBERS]: 'Бомберы',
  [EGame.MACHI_KORO]: 'Machi Koro',
  [EGame.MAHJONG]: 'Маджонг',
};

export const PLAYER_SETTINGS: {
  [Game in EGame]: TPlayerSettings<Game>;
} = {
  [EGame.PEXESO]: {},
  [EGame.SURVIVAL_ONLINE]: {},
  [EGame.SET]: {},
  [EGame.ONITAMA]: {},
  [EGame.CARCASSONNE]: {},
  [EGame.SEVEN_WONDERS]: {},
  [EGame.HEARTS]: {},
  [EGame.BOMBERS]: {},
  [EGame.MACHI_KORO]: {},
  [EGame.MAHJONG]: MAHJONG_PLAYER_SETTINGS,
};

export const BOTS_SUPPORTED_GAMES = [EGame.SEVEN_WONDERS, EGame.HEARTS, EGame.MAHJONG] as const;
