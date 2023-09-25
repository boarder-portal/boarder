import times from 'lodash/times';

import { ALL_DRAGONS, ALL_SUITS, ALL_VALUES, ALL_WINDS } from 'common/constants/games/mahjong';

import {
  DragonColor,
  PlayableTile,
  Set,
  SetConcealedType,
  SetType,
  Suit,
  SuitedTile,
  Tile,
  TileType,
  WindSide,
} from 'common/types/games/mahjong';

import { dragon, suited, wind } from 'common/utilities/games/mahjong/tilesBase';
import { getPermutations } from 'common/utilities/permutations';

export const STANDARD_TILES: PlayableTile[] = [
  ...ALL_SUITS.map((suit) =>
    ALL_VALUES.map((value) => {
      return {
        type: TileType.SUIT,
        suit,
        value,
      } as const;
    }),
  ).flat(),
  ...ALL_WINDS.map((side) => {
    return {
      type: TileType.WIND,
      side,
    } as const;
  }).flat(),
  ...ALL_DRAGONS.map((color) => {
    return {
      type: TileType.DRAGON,
      color,
    } as const;
  }).flat(),
];

export const ALL_FLOWERS = times(8, (index) => {
  return {
    type: TileType.FLOWER,
    index,
  } as const;
});

export const ALL_TILES: Tile[] = [...STANDARD_TILES, ...ALL_FLOWERS];

export const DECK: Tile[] = [...STANDARD_TILES.map((tile) => times(4, () => tile)).flat(), ...ALL_FLOWERS];

export const GREEN_TILES: PlayableTile[] = [
  suited(2, Suit.BAMBOOS),
  suited(3, Suit.BAMBOOS),
  suited(4, Suit.BAMBOOS),
  suited(6, Suit.BAMBOOS),
  suited(8, Suit.BAMBOOS),
  dragon(DragonColor.GREEN),
];

export const ORPHANS: PlayableTile[] = [
  suited(1, Suit.BAMBOOS),
  suited(9, Suit.BAMBOOS),
  suited(1, Suit.CHARACTERS),
  suited(9, Suit.CHARACTERS),
  suited(1, Suit.DOTS),
  suited(9, Suit.DOTS),
  dragon(DragonColor.GREEN),
  dragon(DragonColor.RED),
  dragon(DragonColor.WHITE),
  wind(WindSide.EAST),
  wind(WindSide.SOUTH),
  wind(WindSide.WEST),
  wind(WindSide.NORTH),
];

export const REVERSIBLE_TILES: PlayableTile[] = [
  suited(1, Suit.DOTS),
  suited(2, Suit.DOTS),
  suited(3, Suit.DOTS),
  suited(4, Suit.DOTS),
  suited(5, Suit.DOTS),
  suited(8, Suit.DOTS),
  suited(9, Suit.DOTS),
  suited(2, Suit.BAMBOOS),
  suited(4, Suit.BAMBOOS),
  suited(5, Suit.BAMBOOS),
  suited(6, Suit.BAMBOOS),
  suited(8, Suit.BAMBOOS),
  suited(9, Suit.BAMBOOS),
  dragon(DragonColor.WHITE),
];

export const KNITTED_SEQUENCES: SuitedTile[][][] = getPermutations([
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
]).map((knittedChows) =>
  knittedChows.map((knittedChow, index) => knittedChow.map((value) => suited(value, ALL_SUITS[index]))),
);

export const TERMINAL_CHOWS_SETS: Set[][] = getPermutations([
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
  sets
    .map((values, index) =>
      values.map((values) => ({
        type: values.length === 2 ? SetType.PAIR : SetType.CHOW,
        tiles: values.map((value) => suited(value, ALL_SUITS[index])),
        concealedType: SetConcealedType.CONCEALED,
      })),
    )
    .flat(),
);
