import times from 'lodash/times';

import { ALL_DRAGONS, ALL_SUITS, ALL_VALUES, ALL_WINDS } from 'common/constants/games/mahjong/common';

import {
  EDragon,
  ESet,
  ESetConcealedType,
  ESuit,
  ETileType,
  EWind,
  ISuitedTile,
  TSet,
  TTile,
} from 'common/types/mahjong';

import { dragon, suited, wind } from 'common/utilities/mahjong/tiles';
import { getPermutations } from 'common/utilities/permutations';

export const STANDARD_TILES: TTile[] = [
  ...ALL_SUITS.map((suit) =>
    ALL_VALUES.map((value) => {
      return {
        type: ETileType.SUIT,
        suit,
        value,
      } as const;
    }),
  ).flat(),
  ...ALL_DRAGONS.map((color) => {
    return {
      type: ETileType.DRAGON,
      color,
    } as const;
  }).flat(),
  ...ALL_WINDS.map((side) => {
    return {
      type: ETileType.WIND,
      side,
    } as const;
  }).flat(),
];

export const DECK: TTile[] = [
  ...STANDARD_TILES.map((tile) => times(4, () => tile)).flat(),
  ...times(8, (index) => {
    return {
      type: ETileType.FLOWER,
      index,
    } as const;
  }),
];

export const GREEN_TILES: TTile[] = [
  suited(2, ESuit.BAMBOOS),
  suited(3, ESuit.BAMBOOS),
  suited(4, ESuit.BAMBOOS),
  suited(6, ESuit.BAMBOOS),
  suited(8, ESuit.BAMBOOS),
  dragon(EDragon.GREEN),
];

export const ORPHANS: TTile[] = [
  suited(1, ESuit.BAMBOOS),
  suited(9, ESuit.BAMBOOS),
  suited(1, ESuit.CHARACTERS),
  suited(9, ESuit.CHARACTERS),
  suited(1, ESuit.DOTS),
  suited(9, ESuit.DOTS),
  dragon(EDragon.GREEN),
  dragon(EDragon.RED),
  dragon(EDragon.WHITE),
  wind(EWind.EAST),
  wind(EWind.SOUTH),
  wind(EWind.WEST),
  wind(EWind.NORTH),
];

export const REVERSIBLE_TILES: TTile[] = [
  suited(1, ESuit.DOTS),
  suited(2, ESuit.DOTS),
  suited(3, ESuit.DOTS),
  suited(4, ESuit.DOTS),
  suited(5, ESuit.DOTS),
  suited(8, ESuit.DOTS),
  suited(9, ESuit.DOTS),
  suited(2, ESuit.BAMBOOS),
  suited(4, ESuit.BAMBOOS),
  suited(5, ESuit.BAMBOOS),
  suited(6, ESuit.BAMBOOS),
  suited(8, ESuit.BAMBOOS),
  suited(9, ESuit.BAMBOOS),
  dragon(EDragon.WHITE),
];

export const KNITTED_SEQUENCES: ISuitedTile[][][] = getPermutations([
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
]).map((knittedChows) =>
  knittedChows.map((knittedChow, index) => knittedChow.map((value) => suited(value, ALL_SUITS[index]))),
);

export const TERMINAL_CHOWS_SETS: TSet[][] = getPermutations([
  [
    [1, 2, 3],
    [7, 8, 9],
  ],
  [
    [1, 2, 3],
    [7, 8, 9],
  ],
  [[5, 5]],
]).map((sets) =>
  sets.flat().map((values, index) => ({
    type: values.length === 2 ? ESet.PAIR : ESet.CHOW,
    tiles: values.map((value) => suited(value, ALL_SUITS[index])),
    concealedType: ESetConcealedType.CONCEALED,
  })),
);
