import invert from 'lodash/invert';
import times from 'lodash/times';

import { DragonColor, GameOptions, HandsCount, PlayerSettings, SetType, Suit, WindSide } from 'common/types/mahjong';

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  minPlayersCount: 4,
  maxPlayersCount: 4,
  handsCount: HandsCount.FOUR,
};

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  autoPass: true,
  autoReplaceFlowers: true,
  sortHand: false,
  showLosingHand: true,
  showCurrentTile: false,
  showTileHints: false,
  highlightSameTile: false,
};

export const MIN_SCORE = 8;

export const ALL_SUITS = Object.values(Suit);
export const ALL_VALUES = times(9, (x) => x + 1);
export const ALL_DRAGONS = Object.values(DragonColor);
export const ALL_WINDS = Object.values(WindSide);

export const FLOWERS_STRING_VALUES = '12345678';
export const SUITED_STRING_VALUES = '123456789';

export const DRAGON_TO_STRING_MAP: Record<DragonColor, string> = {
  [DragonColor.RED]: 'r',
  [DragonColor.GREEN]: 'g',
  [DragonColor.WHITE]: 'w',
};

export const STRING_TO_DRAGON_MAP = invert(DRAGON_TO_STRING_MAP) as Partial<Record<string, DragonColor>>;

export const WIND_TO_STRING_MAP: Record<WindSide, string> = {
  [WindSide.EAST]: 'e',
  [WindSide.SOUTH]: 's',
  [WindSide.WEST]: 'w',
  [WindSide.NORTH]: 'n',
};

export const STRING_TO_WIND_MAP = invert(WIND_TO_STRING_MAP) as Partial<Record<string, WindSide>>;

export const SUIT_TO_STRING_MAP: Record<Suit, string> = {
  [Suit.BAMBOOS]: 'b',
  [Suit.CHARACTERS]: 'c',
  [Suit.DOTS]: 'd',
};

export const STRING_TO_SUIT_MAP = invert(SUIT_TO_STRING_MAP) as Partial<Record<string, Suit>>;

export const SET_NAMES: Record<SetType, string> = {
  [SetType.PAIR]: 'Пара',
  [SetType.PUNG]: 'Панг',
  [SetType.KONG]: 'Конг',
  [SetType.CHOW]: 'Чоу',
  [SetType.KNITTED_CHOW]: 'Переплетенное чоу',
};

export const WIND_NAMES: Record<WindSide, string> = {
  [WindSide.EAST]: 'Восток',
  [WindSide.SOUTH]: 'Юг',
  [WindSide.WEST]: 'Запад',
  [WindSide.NORTH]: 'Север',
};

export const WIND_SHORT_NAMES: Record<WindSide, string> = {
  [WindSide.EAST]: 'В',
  [WindSide.SOUTH]: 'Ю',
  [WindSide.WEST]: 'З',
  [WindSide.NORTH]: 'С',
};

export const HAND_COUNTS: Record<HandsCount, number> = {
  [HandsCount.ONE]: 1,
  [HandsCount.FOUR]: 4,
  [HandsCount.SIXTEEN]: 16,
};
