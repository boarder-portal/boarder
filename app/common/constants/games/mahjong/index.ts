import invert from 'lodash/invert';

import { EDragon, ESuit, EWind, IGameOptions } from 'common/types/mahjong';

export * from './common';
export * from './impliedFans';
export * from './tiles';

export const DEFAULT_GAME_OPTIONS: IGameOptions = {
  minPlayersCount: 4,
  maxPlayersCount: 4,
};

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
