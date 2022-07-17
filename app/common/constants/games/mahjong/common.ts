import times from 'lodash/times';

import { EDragon, ESuit, EWind } from 'common/types/mahjong';

export const ALL_SUITS = Object.values(ESuit);
export const ALL_VALUES = times(9, (x) => x + 1);
export const ALL_DRAGONS = Object.values(EDragon);
export const ALL_WINDS = Object.values(EWind);
