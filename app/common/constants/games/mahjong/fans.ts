import { EFan } from 'common/types/mahjong';

export const FAN_SCORES: Record<EFan, number> = {
  // 88 points
  [EFan.BIG_FOUR_WINDS]: 88,
  [EFan.BIG_THREE_DRAGONS]: 88,
  [EFan.ALL_GREEN]: 88,
  [EFan.NINE_GATES]: 88,
  [EFan.FOUR_KONGS]: 88,
  [EFan.SEVEN_SHIFTED_PAIRS]: 88,
  [EFan.THIRTEEN_ORPHANS]: 88,

  // 64 points
  [EFan.ALL_TERMINALS]: 64,
  [EFan.LITTLE_FOUR_WINDS]: 64,
  [EFan.LITTLE_THREE_DRAGONS]: 64,
  [EFan.ALL_HONORS]: 64,
  [EFan.FOUR_CONCEALED_PUNGS]: 64,
  [EFan.PURE_TERMINAL_CHOWS]: 64,

  // 48 points
  [EFan.QUADRUPLE_CHOWS]: 48,
  [EFan.FOUR_PURE_SHIFTED_PUNGS]: 48,

  // 32 points
  [EFan.FOUR_PURE_SHIFTED_CHOWS]: 32,
  [EFan.THREE_KONGS]: 32,
  [EFan.ALL_TERMINALS_AND_HONORS]: 32,

  // 24 points
  [EFan.SEVEN_PAIRS]: 24,
  [EFan.GREATER_HONORS_AND_KNITTED_TILES]: 24,
  [EFan.ALL_EVEN_PUNGS]: 24,
  [EFan.FULL_FLUSH]: 24,
  [EFan.PURE_TRIPLE_CHOW]: 24,
  [EFan.PURE_SHIFTED_PUNGS]: 24,
  [EFan.UPPER_TILES]: 24,
  [EFan.MIDDLE_TILES]: 24,
  [EFan.LOWER_TILES]: 24,

  // 16 points
  [EFan.PURE_STRAIGHT]: 16,
  [EFan.THREE_SUITED_TERMINAL_CHOWS]: 16,
  [EFan.PURE_SHIFTED_CHOWS]: 16,
  [EFan.ALL_FIVES]: 16,
  [EFan.TRIPLE_PUNG]: 16,
  [EFan.THREE_CONCEALED_PUNGS]: 16,

  // 12 points
  [EFan.LESSER_HONORS_AND_KNITTED_TILES]: 12,
  [EFan.KNITTED_STRAIGHT]: 12,
  [EFan.UPPER_FOUR]: 12,
  [EFan.LOWER_FOUR]: 12,
  [EFan.BIG_THREE_WINDS]: 12,

  // 8 points
  [EFan.MIXED_STRAIGHT]: 8,
  [EFan.REVERSIBLE_TILES]: 8,
  [EFan.MIXED_TRIPLE_CHOW]: 8,
  [EFan.MIXED_SHIFTED_PUNGS]: 8,
  [EFan.CHICKEN_HAND]: 8,
  [EFan.LAST_TILE_DRAW]: 8,
  [EFan.LAST_TILE_CLAIM]: 8,
  [EFan.OUT_WITH_REPLACEMENT_TILE]: 8,
  [EFan.ROBBING_THE_KONG]: 8,
  [EFan.TWO_CONCEALED_KONGS]: 8,

  // 6 points
  [EFan.ALL_PUNGS]: 6,
  [EFan.HALF_FLUSH]: 6,
  [EFan.MIXED_SHIFTED_CHOWS]: 6,
  [EFan.ALL_TYPES]: 6,
  [EFan.MELDED_HAND]: 6,
  [EFan.TWO_DRAGON_PUNGS]: 6,

  // 4 points
  [EFan.OUTSIDE_HAND]: 4,
  [EFan.FULLY_CONCEALED_HAND]: 4,
  [EFan.TWO_MELDED_KONGS]: 4,
  [EFan.LAST_TILE]: 4,

  // 2 points
  [EFan.DRAGON_PUNG]: 2,
  [EFan.PREVALENT_WIND]: 2,
  [EFan.SEAT_WIND]: 2,
  [EFan.CONCEALED_HAND]: 2,
  [EFan.ALL_CHOWS]: 2,
  [EFan.TILE_HOG]: 2,
  [EFan.DOUBLE_PUNG]: 2,
  [EFan.TWO_CONCEALED_PUNGS]: 2,
  [EFan.CONCEALED_KONG]: 2,
  [EFan.ALL_SIMPLES]: 2,

  // 1 point
  [EFan.PURE_DOUBLE_CHOW]: 1,
  [EFan.MIXED_DOUBLE_CHOW]: 1,
  [EFan.SHORT_STRAIGHT]: 1,
  [EFan.TWO_TERMINAL_CHOWS]: 1,
  [EFan.PUNG_OF_TERMINALS_OR_HONORS]: 1,
  [EFan.MELDED_KONG]: 1,
  [EFan.ONE_VOIDED_SUIT]: 1,
  [EFan.NO_HONORS]: 1,
  [EFan.EDGE_WAIT]: 1,
  [EFan.CLOSED_WAIT]: 1,
  [EFan.SINGLE_WAIT]: 1,
  [EFan.SELF_DRAWN]: 1,
  [EFan.FLOWER_TILES]: 1,
};