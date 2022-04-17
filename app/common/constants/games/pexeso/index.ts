import { EPexesoFieldLayout, EPexesoSet, IPexesoGameOptions } from 'common/types/pexeso';

interface ISetConfig {
  imagesCount: number;
  imageVariantsCount: number;
}

interface IFieldOptions {
  [EPexesoFieldLayout.RECT]: Record<number, {
    width: number;
    height: number;
  }>;
  [EPexesoFieldLayout.HEX]: Record<number, {
    start: number;
    middle: number;
  }>;
}

export const DEFAULT_GAME_OPTIONS: IPexesoGameOptions = {
  set: EPexesoSet.COMMON,
  playersCount: 2,
  matchingCardsCount: 2,
  differentCardsCount: 30,
  layout: EPexesoFieldLayout.RECT,
  pickRandomImages: false,
  useImageVariants: false,
  shuffleOptions: null,
};

export const MIN_PLAYERS_COUNT = 2;
export const MAX_PLAYERS_COUNT = 4;
export const MATCHING_CARDS_COUNTS = [2, 3, 4, 5, 6];
export const DIFFERENT_CARDS_COUNTS = [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 40, 48, 54, 60, 72, 84];
export const SHUFFLE_AFTER_MOVES_COUNTS = [1, 2, 3, 4, 5, 6];
export const SHUFFLE_CARDS_COUNTS = [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 40, 48, 54, 60, 72, 84];

export const FIELD_OPTIONS: IFieldOptions = {
  [EPexesoFieldLayout.RECT]: {
    8: { width: 4, height: 2 },
    12: { width: 4, height: 3 },
    16: { width: 4, height: 4 },
    18: { width: 6, height: 3 },
    20: { width: 5, height: 4 },
    24: { width: 6, height: 4 },
    30: { width: 6, height: 5 },
    32: { width: 8, height: 4 },
    36: { width: 6, height: 6 },
    40: { width: 8, height: 5 },
    48: { width: 8, height: 6 },
    50: { width: 10, height: 5 },
    60: { width: 10, height: 6 },
    64: { width: 8, height: 8 },
    72: { width: 9, height: 8 },
    80: { width: 10, height: 8 },
    90: { width: 10, height: 9 },
    96: { width: 12, height: 8 },
    100: { width: 10, height: 10 },
    108: { width: 12, height: 9 },
    120: { width: 12, height: 10 },
    150: { width: 15, height: 10 },
    144: { width: 16, height: 9 },
    160: { width: 16, height: 10 },
    162: { width: 18, height: 9 },
    168: { width: 14, height: 12 },
    180: { width: 18, height: 10 },
    192: { width: 16, height: 12 },
    200: { width: 20, height: 10 },
    216: { width: 18, height: 12 },
    240: { width: 20, height: 12 },
    252: { width: 21, height: 12 },
    270: { width: 18, height: 15 },
    288: { width: 18, height: 16 },
    300: { width: 20, height: 15 },
    324: { width: 18, height: 18 },
    336: { width: 24, height: 14 },
    360: { width: 24, height: 15 },
    420: { width: 28, height: 15 },
    // 432: { width: 24, height: 18 },
    432: { width: 27, height: 16 },
    504: { width: 28, height: 18 },
  },
  [EPexesoFieldLayout.HEX]: {
    16: { start: 5, middle: 6 },
    24: { start: 4, middle: 6 },
    72: { start: 9, middle: 12 },
    168: { start: 13, middle: 18 },
    192: { start: 12, middle: 18 },
    336: { start: 16, middle: 24 },
  },
};

export const LAYOUT_NAMES: Record<EPexesoFieldLayout, string> = {
  [EPexesoFieldLayout.RECT]: 'Прямоугольник',
  [EPexesoFieldLayout.HEX]: 'Шестиугольник',
  [EPexesoFieldLayout.SPIRAL]: 'Спираль',
  [EPexesoFieldLayout.SPIRAL_ROTATE]: 'Спираль (поворот)',
};

export const SETS: Record<EPexesoSet, ISetConfig> = {
  [EPexesoSet.COMMON]: {
    imagesCount: 30,
    imageVariantsCount: 4,
  },
  [EPexesoSet.FRIENDS]: {
    imagesCount: 30,
    imageVariantsCount: 2,
  },
  [EPexesoSet.GAME_OF_THRONES]: {
    imagesCount: 84,
    imageVariantsCount: 1,
  },
  [EPexesoSet.HARRY_POTTER]: {
    imagesCount: 30,
    imageVariantsCount: 1,
  },
  [EPexesoSet.LOST]: {
    imagesCount: 40,
    imageVariantsCount: 2,
  },
  [EPexesoSet.PHILADELPHIA]: {
    imagesCount: 30,
    imageVariantsCount: 1,
  },
  [EPexesoSet.PIRATES]: {
    imagesCount: 30,
    imageVariantsCount: 1,
  },
  [EPexesoSet.POKER]: {
    imagesCount: 30,
    imageVariantsCount: 1,
  },
  [EPexesoSet.STAR_WARS]: {
    imagesCount: 40,
    imageVariantsCount: 1,
  },
  [EPexesoSet.DST]: {
    imagesCount: 40,
    imageVariantsCount: 1,
  },
  [EPexesoSet.BUILDINGS]: {
    imagesCount: 30,
    imageVariantsCount: 1,
  },
  [EPexesoSet.BREAKING_BAD]: {
    imagesCount: 20,
    imageVariantsCount: 1,
  },
};
