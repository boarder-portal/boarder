import invert from 'lodash/invert';
import times from 'lodash/times';

import { EDragon, EHandsCount, ESet, ESuit, EWind, IGameOptions, IPlayerSettings } from 'common/types/mahjong';

export const DEFAULT_GAME_OPTIONS: IGameOptions = {
  minPlayersCount: 4,
  maxPlayersCount: 4,
  handsCount: EHandsCount.FOUR,
};

export const DEFAULT_PLAYER_SETTINGS: IPlayerSettings = {
  autoPass: true,
  autoReplaceFlowers: true,
  sortHand: false,
  showLosingHand: true,
  showCurrentTile: false,
};

export const MIN_SCORE = 8;

export const ALL_SUITS = Object.values(ESuit);
export const ALL_VALUES = times(9, (x) => x + 1);
export const ALL_DRAGONS = Object.values(EDragon);
export const ALL_WINDS = Object.values(EWind);

export const FLOWERS_STRING_VALUES = '12345678';
export const SUITED_STRING_VALUES = '123456789';

export const DRAGON_TO_STRING_MAP: Record<EDragon, string> = {
  [EDragon.RED]: 'r',
  [EDragon.GREEN]: 'g',
  [EDragon.WHITE]: 'w',
};

export const STRING_TO_DRAGON_MAP = invert(DRAGON_TO_STRING_MAP) as Partial<Record<string, EDragon>>;

export const WIND_TO_STRING_MAP: Record<EWind, string> = {
  [EWind.EAST]: 'e',
  [EWind.SOUTH]: 's',
  [EWind.WEST]: 'w',
  [EWind.NORTH]: 'n',
};

export const STRING_TO_WIND_MAP = invert(WIND_TO_STRING_MAP) as Partial<Record<string, EWind>>;

export const SUIT_TO_STRING_MAP: Record<ESuit, string> = {
  [ESuit.BAMBOOS]: 'b',
  [ESuit.CHARACTERS]: 'c',
  [ESuit.DOTS]: 'd',
};

export const STRING_TO_SUIT_MAP = invert(SUIT_TO_STRING_MAP) as Partial<Record<string, ESuit>>;

export const SET_NAMES: Record<ESet, string> = {
  [ESet.PAIR]: 'Пара',
  [ESet.PUNG]: 'Панг',
  [ESet.KONG]: 'Конг',
  [ESet.CHOW]: 'Чоу',
  [ESet.KNITTED_CHOW]: 'Переплетенное чоу',
};

export const WIND_NAMES: Record<EWind, string> = {
  [EWind.EAST]: 'Восточный',
  [EWind.SOUTH]: 'Южный',
  [EWind.WEST]: 'Западный',
  [EWind.NORTH]: 'Северный',
};

export const WIND_SHORT_NAMES: Record<EWind, string> = {
  [EWind.EAST]: 'Восток',
  [EWind.SOUTH]: 'Юг',
  [EWind.WEST]: 'Запад',
  [EWind.NORTH]: 'Север',
};

export const HAND_COUNTS: Record<EHandsCount, number> = {
  [EHandsCount.ONE]: 1,
  [EHandsCount.FOUR]: 4,
  [EHandsCount.SIXTEEN]: 16,
};
