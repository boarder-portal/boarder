import times from 'lodash/times';

import { EDragon, ESuit, ETileType, EWind, TTile } from 'common/types/mahjong';

import { dragon, suited, wind } from 'common/utilities/mahjong/tiles';

export const STANDARD_TILES: TTile[] = [
  ...Object.values(ESuit)
    .map((suit) =>
      times(9, (value) => {
        return {
          type: ETileType.SUIT,
          suit,
          value: value + 1,
        } as const;
      }),
    )
    .flat(),
  ...Object.values(EDragon)
    .map((color) => {
      return {
        type: ETileType.DRAGON,
        color,
      } as const;
    })
    .flat(),
  ...Object.values(EWind)
    .map((side) => {
      return {
        type: ETileType.WIND,
        side,
      } as const;
    })
    .flat(),
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
