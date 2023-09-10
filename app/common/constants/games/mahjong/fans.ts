import { FanKind, Tile } from 'common/types/games/mahjong';

import { parsePlayableTileSets } from 'common/utilities/mahjong/parse';

export const ALL_FANS = Object.values(FanKind);

export const FAN_SCORES: Record<FanKind, number> = {
  // 88 points
  [FanKind.BIG_FOUR_WINDS]: 88,
  [FanKind.BIG_THREE_DRAGONS]: 88,
  [FanKind.ALL_GREEN]: 88,
  [FanKind.NINE_GATES]: 88,
  [FanKind.FOUR_KONGS]: 88,
  [FanKind.SEVEN_SHIFTED_PAIRS]: 88,
  [FanKind.THIRTEEN_ORPHANS]: 88,

  // 64 points
  [FanKind.ALL_TERMINALS]: 64,
  [FanKind.LITTLE_FOUR_WINDS]: 64,
  [FanKind.LITTLE_THREE_DRAGONS]: 64,
  [FanKind.ALL_HONORS]: 64,
  [FanKind.FOUR_CONCEALED_PUNGS]: 64,
  [FanKind.PURE_TERMINAL_CHOWS]: 64,

  // 48 points
  [FanKind.QUADRUPLE_CHOW]: 48,
  [FanKind.FOUR_PURE_SHIFTED_PUNGS]: 48,

  // 32 points
  [FanKind.FOUR_PURE_SHIFTED_CHOWS]: 32,
  [FanKind.THREE_KONGS]: 32,
  [FanKind.ALL_TERMINALS_AND_HONORS]: 32,

  // 24 points
  [FanKind.SEVEN_PAIRS]: 24,
  [FanKind.GREATER_HONORS_AND_KNITTED_TILES]: 24,
  [FanKind.ALL_EVEN_PUNGS]: 24,
  [FanKind.FULL_FLUSH]: 24,
  [FanKind.PURE_TRIPLE_CHOW]: 24,
  [FanKind.PURE_SHIFTED_PUNGS]: 24,
  [FanKind.UPPER_TILES]: 24,
  [FanKind.MIDDLE_TILES]: 24,
  [FanKind.LOWER_TILES]: 24,

  // 16 points
  [FanKind.PURE_STRAIGHT]: 16,
  [FanKind.THREE_SUITED_TERMINAL_CHOWS]: 16,
  [FanKind.PURE_SHIFTED_CHOWS]: 16,
  [FanKind.ALL_FIVES]: 16,
  [FanKind.TRIPLE_PUNG]: 16,
  [FanKind.THREE_CONCEALED_PUNGS]: 16,

  // 12 points
  [FanKind.LESSER_HONORS_AND_KNITTED_TILES]: 12,
  [FanKind.KNITTED_STRAIGHT]: 12,
  [FanKind.UPPER_FOUR]: 12,
  [FanKind.LOWER_FOUR]: 12,
  [FanKind.BIG_THREE_WINDS]: 12,

  // 8 points
  [FanKind.MIXED_STRAIGHT]: 8,
  [FanKind.REVERSIBLE_TILES]: 8,
  [FanKind.MIXED_TRIPLE_CHOW]: 8,
  [FanKind.MIXED_SHIFTED_PUNGS]: 8,
  [FanKind.CHICKEN_HAND]: 8,
  [FanKind.LAST_TILE_DRAW]: 8,
  [FanKind.LAST_TILE_CLAIM]: 8,
  [FanKind.OUT_WITH_REPLACEMENT_TILE]: 8,
  [FanKind.ROBBING_THE_KONG]: 8,
  [FanKind.TWO_CONCEALED_KONGS]: 8,

  // 6 points
  [FanKind.ALL_PUNGS]: 6,
  [FanKind.HALF_FLUSH]: 6,
  [FanKind.MIXED_SHIFTED_CHOWS]: 6,
  [FanKind.ALL_TYPES]: 6,
  [FanKind.MELDED_HAND]: 6,
  [FanKind.TWO_DRAGON_PUNGS]: 6,

  // 4 points
  [FanKind.OUTSIDE_HAND]: 4,
  [FanKind.FULLY_CONCEALED_HAND]: 4,
  [FanKind.TWO_MELDED_KONGS]: 4,
  [FanKind.LAST_TILE]: 4,

  // 2 points
  [FanKind.DRAGON_PUNG]: 2,
  [FanKind.PREVALENT_WIND]: 2,
  [FanKind.SEAT_WIND]: 2,
  [FanKind.CONCEALED_HAND]: 2,
  [FanKind.ALL_CHOWS]: 2,
  [FanKind.TILE_HOG]: 2,
  [FanKind.DOUBLE_PUNG]: 2,
  [FanKind.TWO_CONCEALED_PUNGS]: 2,
  [FanKind.CONCEALED_KONG]: 2,
  [FanKind.ALL_SIMPLES]: 2,

  // 1 point
  [FanKind.PURE_DOUBLE_CHOW]: 1,
  [FanKind.MIXED_DOUBLE_CHOW]: 1,
  [FanKind.SHORT_STRAIGHT]: 1,
  [FanKind.TWO_TERMINAL_CHOWS]: 1,
  [FanKind.PUNG_OF_TERMINALS_OR_HONORS]: 1,
  [FanKind.MELDED_KONG]: 1,
  [FanKind.ONE_VOIDED_SUIT]: 1,
  [FanKind.NO_HONORS]: 1,
  [FanKind.EDGE_WAIT]: 1,
  [FanKind.CLOSED_WAIT]: 1,
  [FanKind.SINGLE_WAIT]: 1,
  [FanKind.SELF_DRAWN]: 1,
  [FanKind.FLOWER_TILES]: 1,
};

export const NO_SETS_FANS = [
  FanKind.THIRTEEN_ORPHANS,
  FanKind.GREATER_HONORS_AND_KNITTED_TILES,
  FanKind.LESSER_HONORS_AND_KNITTED_TILES,
];

export const IMPLIED_FANS: Partial<Record<FanKind, FanKind[]>> = {
  // 88 points
  [FanKind.BIG_FOUR_WINDS]: [
    FanKind.BIG_THREE_WINDS,
    FanKind.ALL_PUNGS,
    FanKind.SEAT_WIND,
    FanKind.PREVALENT_WIND,
    FanKind.PUNG_OF_TERMINALS_OR_HONORS,
  ],
  [FanKind.BIG_THREE_DRAGONS]: [FanKind.TWO_DRAGON_PUNGS, FanKind.DRAGON_PUNG, FanKind.PUNG_OF_TERMINALS_OR_HONORS],
  [FanKind.NINE_GATES]: [
    FanKind.FULL_FLUSH,
    FanKind.CONCEALED_HAND,
    FanKind.PUNG_OF_TERMINALS_OR_HONORS,
    FanKind.NO_HONORS,
  ],
  [FanKind.FOUR_KONGS]: [
    FanKind.THREE_KONGS,
    FanKind.TWO_CONCEALED_KONGS,
    FanKind.TWO_MELDED_KONGS,
    FanKind.CONCEALED_KONG,
    FanKind.MELDED_KONG,
    FanKind.ALL_PUNGS,
    FanKind.SINGLE_WAIT,
  ],
  [FanKind.SEVEN_SHIFTED_PAIRS]: [
    FanKind.SEVEN_PAIRS,
    FanKind.FULL_FLUSH,
    FanKind.CONCEALED_HAND,
    FanKind.SINGLE_WAIT,
    FanKind.NO_HONORS,
  ],
  [FanKind.THIRTEEN_ORPHANS]: [
    FanKind.ALL_TYPES,
    FanKind.ALL_TERMINALS_AND_HONORS,
    FanKind.CONCEALED_HAND,
    FanKind.SINGLE_WAIT,
  ],

  // 64 points
  [FanKind.ALL_TERMINALS]: [
    FanKind.ALL_TERMINALS_AND_HONORS,
    FanKind.ALL_PUNGS,
    FanKind.OUTSIDE_HAND,
    FanKind.PUNG_OF_TERMINALS_OR_HONORS,
    FanKind.NO_HONORS,
  ],
  [FanKind.LITTLE_FOUR_WINDS]: [FanKind.BIG_THREE_WINDS, FanKind.PUNG_OF_TERMINALS_OR_HONORS],
  [FanKind.LITTLE_THREE_DRAGONS]: [FanKind.TWO_DRAGON_PUNGS, FanKind.DRAGON_PUNG, FanKind.PUNG_OF_TERMINALS_OR_HONORS],
  [FanKind.ALL_HONORS]: [
    FanKind.ALL_TERMINALS_AND_HONORS,
    FanKind.ALL_PUNGS,
    FanKind.PUNG_OF_TERMINALS_OR_HONORS,
    FanKind.OUTSIDE_HAND,
  ],
  [FanKind.FOUR_CONCEALED_PUNGS]: [
    FanKind.ALL_PUNGS,
    FanKind.THREE_CONCEALED_PUNGS,
    FanKind.TWO_CONCEALED_PUNGS,
    FanKind.CONCEALED_HAND,
  ],
  [FanKind.PURE_TERMINAL_CHOWS]: [
    FanKind.FULL_FLUSH,
    FanKind.ALL_CHOWS,
    FanKind.PURE_DOUBLE_CHOW,
    FanKind.TWO_TERMINAL_CHOWS,
    FanKind.NO_HONORS,
  ],

  // 48 points
  [FanKind.QUADRUPLE_CHOW]: [FanKind.PURE_TRIPLE_CHOW, FanKind.PURE_DOUBLE_CHOW, FanKind.TILE_HOG],
  [FanKind.FOUR_PURE_SHIFTED_PUNGS]: [FanKind.PURE_SHIFTED_PUNGS, FanKind.ALL_PUNGS],

  // 32 points
  [FanKind.FOUR_PURE_SHIFTED_CHOWS]: [FanKind.PURE_SHIFTED_CHOWS, FanKind.SHORT_STRAIGHT, FanKind.TWO_TERMINAL_CHOWS],
  [FanKind.THREE_KONGS]: [
    FanKind.TWO_CONCEALED_KONGS,
    FanKind.TWO_MELDED_KONGS,
    FanKind.CONCEALED_KONG,
    FanKind.MELDED_KONG,
  ],
  [FanKind.ALL_TERMINALS_AND_HONORS]: [FanKind.PUNG_OF_TERMINALS_OR_HONORS, FanKind.ALL_PUNGS, FanKind.OUTSIDE_HAND],

  // 24 points
  [FanKind.SEVEN_PAIRS]: [FanKind.CONCEALED_HAND, FanKind.SINGLE_WAIT],
  [FanKind.GREATER_HONORS_AND_KNITTED_TILES]: [FanKind.ALL_TYPES, FanKind.CONCEALED_HAND],
  [FanKind.ALL_EVEN_PUNGS]: [FanKind.ALL_PUNGS, FanKind.NO_HONORS, FanKind.ALL_SIMPLES],
  [FanKind.FULL_FLUSH]: [FanKind.NO_HONORS],
  [FanKind.PURE_TRIPLE_CHOW]: [FanKind.PURE_DOUBLE_CHOW],
  [FanKind.UPPER_TILES]: [FanKind.UPPER_FOUR, FanKind.NO_HONORS],
  [FanKind.MIDDLE_TILES]: [FanKind.ALL_SIMPLES, FanKind.NO_HONORS],
  [FanKind.LOWER_TILES]: [FanKind.LOWER_FOUR, FanKind.NO_HONORS],

  // 16 points
  [FanKind.PURE_STRAIGHT]: [FanKind.SHORT_STRAIGHT, FanKind.TWO_TERMINAL_CHOWS],
  [FanKind.THREE_SUITED_TERMINAL_CHOWS]: [
    FanKind.TWO_TERMINAL_CHOWS,
    FanKind.ALL_CHOWS,
    FanKind.NO_HONORS,
    FanKind.MIXED_DOUBLE_CHOW,
  ],
  [FanKind.ALL_FIVES]: [FanKind.ALL_SIMPLES, FanKind.NO_HONORS],
  [FanKind.TRIPLE_PUNG]: [FanKind.DOUBLE_PUNG],
  [FanKind.THREE_CONCEALED_PUNGS]: [FanKind.TWO_CONCEALED_PUNGS],

  // 12 points
  [FanKind.LESSER_HONORS_AND_KNITTED_TILES]: [FanKind.ALL_TYPES, FanKind.CONCEALED_HAND],
  [FanKind.UPPER_FOUR]: [FanKind.NO_HONORS],
  [FanKind.LOWER_FOUR]: [FanKind.NO_HONORS],
  [FanKind.BIG_THREE_WINDS]: [FanKind.PUNG_OF_TERMINALS_OR_HONORS],

  // 8 points
  [FanKind.REVERSIBLE_TILES]: [FanKind.ONE_VOIDED_SUIT],
  [FanKind.MIXED_TRIPLE_CHOW]: [FanKind.MIXED_DOUBLE_CHOW],
  [FanKind.LAST_TILE_DRAW]: [FanKind.SELF_DRAWN],
  [FanKind.OUT_WITH_REPLACEMENT_TILE]: [FanKind.SELF_DRAWN],
  [FanKind.ROBBING_THE_KONG]: [FanKind.LAST_TILE],
  [FanKind.TWO_CONCEALED_KONGS]: [FanKind.TWO_CONCEALED_PUNGS, FanKind.CONCEALED_KONG],

  // 6 points
  [FanKind.MELDED_HAND]: [FanKind.SINGLE_WAIT],
  [FanKind.TWO_DRAGON_PUNGS]: [FanKind.DRAGON_PUNG, FanKind.PUNG_OF_TERMINALS_OR_HONORS],

  // 4 points
  [FanKind.FULLY_CONCEALED_HAND]: [FanKind.CONCEALED_HAND, FanKind.SELF_DRAWN],
  [FanKind.TWO_MELDED_KONGS]: [FanKind.MELDED_KONG],

  // 2 points
  [FanKind.DRAGON_PUNG]: [FanKind.PUNG_OF_TERMINALS_OR_HONORS],
  [FanKind.PREVALENT_WIND]: [FanKind.PUNG_OF_TERMINALS_OR_HONORS],
  [FanKind.SEAT_WIND]: [FanKind.PUNG_OF_TERMINALS_OR_HONORS],
  [FanKind.ALL_CHOWS]: [FanKind.NO_HONORS],
  [FanKind.ALL_SIMPLES]: [FanKind.NO_HONORS],
};

export const FAN_NAMES: Record<FanKind, string> = {
  // 88 points
  [FanKind.BIG_FOUR_WINDS]: 'Большие четыре ветра',
  [FanKind.BIG_THREE_DRAGONS]: 'Большие три дракона',
  [FanKind.ALL_GREEN]: 'Все зеленые',
  [FanKind.NINE_GATES]: 'Девять врат',
  [FanKind.FOUR_KONGS]: 'Четыре конга',
  [FanKind.SEVEN_SHIFTED_PAIRS]: 'Семь смещенных пар',
  [FanKind.THIRTEEN_ORPHANS]: 'Тринадцать сирот',

  // 64 points
  [FanKind.ALL_TERMINALS]: 'Все терминальные',
  [FanKind.LITTLE_FOUR_WINDS]: 'Малые четыре ветра',
  [FanKind.LITTLE_THREE_DRAGONS]: 'Малые три дракона',
  [FanKind.ALL_HONORS]: 'Все благородные',
  [FanKind.FOUR_CONCEALED_PUNGS]: 'Четыре закрытых панга',
  [FanKind.PURE_TERMINAL_CHOWS]: 'Чистые терминальные чоу',

  // 48 points
  [FanKind.QUADRUPLE_CHOW]: 'Четверное чоу',
  [FanKind.FOUR_PURE_SHIFTED_PUNGS]: 'Четыре чистых смещенных панга',

  // 32 points
  [FanKind.FOUR_PURE_SHIFTED_CHOWS]: 'Четыре чистых смещенных чоу',
  [FanKind.THREE_KONGS]: 'Три конга',
  [FanKind.ALL_TERMINALS_AND_HONORS]: 'Все терминальные и благородные',

  // 24 points
  [FanKind.SEVEN_PAIRS]: 'Семь пар',
  [FanKind.GREATER_HONORS_AND_KNITTED_TILES]: 'Большие благородные и переплетенные кости',
  [FanKind.ALL_EVEN_PUNGS]: 'Все четные панги',
  [FanKind.FULL_FLUSH]: 'Полное изобилие',
  [FanKind.PURE_TRIPLE_CHOW]: 'Чистое тройное чоу',
  [FanKind.PURE_SHIFTED_PUNGS]: 'Чистые смещенные панги',
  [FanKind.UPPER_TILES]: 'Верхние кости',
  [FanKind.MIDDLE_TILES]: 'Средние кости',
  [FanKind.LOWER_TILES]: 'Нижние кости',

  // 16 points
  [FanKind.PURE_STRAIGHT]: 'Чистый ряд',
  [FanKind.THREE_SUITED_TERMINAL_CHOWS]: 'Три масти и терминальные чоу',
  [FanKind.PURE_SHIFTED_CHOWS]: 'Чистые смещенные чоу',
  [FanKind.ALL_FIVES]: 'Все пятерки',
  [FanKind.TRIPLE_PUNG]: 'Тройной панг',
  [FanKind.THREE_CONCEALED_PUNGS]: 'Три закрытых панга',

  // 12 points
  [FanKind.LESSER_HONORS_AND_KNITTED_TILES]: 'Малые благородные и переплетенные кости',
  [FanKind.KNITTED_STRAIGHT]: 'Переплетенный ряд',
  [FanKind.UPPER_FOUR]: 'Четыре верхних',
  [FanKind.LOWER_FOUR]: 'Четыре нижних',
  [FanKind.BIG_THREE_WINDS]: 'Большие три ветра',

  // 8 points
  [FanKind.MIXED_STRAIGHT]: 'Смешанный ряд',
  [FanKind.REVERSIBLE_TILES]: 'Симметричные кости',
  [FanKind.MIXED_TRIPLE_CHOW]: 'Смешанное тройное чоу',
  [FanKind.MIXED_SHIFTED_PUNGS]: 'Смешанные смещенные панги',
  [FanKind.CHICKEN_HAND]: 'Цыплячья рука',
  [FanKind.LAST_TILE_DRAW]: 'Последняя кость со стены',
  [FanKind.LAST_TILE_CLAIM]: 'Последний снос',
  [FanKind.OUT_WITH_REPLACEMENT_TILE]: 'Выигрыш замещающей костью',
  [FanKind.ROBBING_THE_KONG]: 'Ограбление конга',
  [FanKind.TWO_CONCEALED_KONGS]: 'Два закрытых конга',

  // 6 points
  [FanKind.ALL_PUNGS]: 'Все панги',
  [FanKind.HALF_FLUSH]: 'Пол-изобилия',
  [FanKind.MIXED_SHIFTED_CHOWS]: 'Смешанные смещенные чоу',
  [FanKind.ALL_TYPES]: 'Все типы',
  [FanKind.MELDED_HAND]: 'Открытая рука',
  [FanKind.TWO_DRAGON_PUNGS]: 'Два панга драконов',

  // 4 points
  [FanKind.OUTSIDE_HAND]: 'Внешняя рука',
  [FanKind.FULLY_CONCEALED_HAND]: 'Полностью закрытая рука',
  [FanKind.TWO_MELDED_KONGS]: 'Два открытых конга',
  [FanKind.LAST_TILE]: 'Последняя кость',

  // 2 points
  [FanKind.DRAGON_PUNG]: 'Панг драконов',
  [FanKind.PREVALENT_WIND]: 'Преимущественный ветер',
  [FanKind.SEAT_WIND]: 'Ветер места',
  [FanKind.CONCEALED_HAND]: 'Закрытая рука',
  [FanKind.ALL_CHOWS]: 'Все чоу',
  [FanKind.TILE_HOG]: 'Четыре врозь',
  [FanKind.DOUBLE_PUNG]: 'Двойной панг',
  [FanKind.TWO_CONCEALED_PUNGS]: 'Два закрытых панга',
  [FanKind.CONCEALED_KONG]: 'Закрытый конг',
  [FanKind.ALL_SIMPLES]: 'Все простые',

  // 1 point
  [FanKind.PURE_DOUBLE_CHOW]: 'Чистое двойное чоу',
  [FanKind.MIXED_DOUBLE_CHOW]: 'Смешанное двойное чоу',
  [FanKind.SHORT_STRAIGHT]: 'Короткий ряд',
  [FanKind.TWO_TERMINAL_CHOWS]: 'Два терминальных чоу',
  [FanKind.PUNG_OF_TERMINALS_OR_HONORS]: 'Панг терминальных или благородных',
  [FanKind.MELDED_KONG]: 'Открытый конг',
  [FanKind.ONE_VOIDED_SUIT]: 'Пропущенная масть',
  [FanKind.NO_HONORS]: 'Без благородных',
  [FanKind.EDGE_WAIT]: 'Крайнее ожидание',
  [FanKind.CLOSED_WAIT]: 'Закрытое ожидание',
  [FanKind.SINGLE_WAIT]: 'Ожидание единственной',
  [FanKind.SELF_DRAWN]: 'Выигрыш со стены',
  [FanKind.FLOWER_TILES]: 'Цветок',
};

export const FAN_DESCRIPTIONS: Record<FanKind, string> = {
  // 88 points
  [FanKind.BIG_FOUR_WINDS]: 'Панги или конги из костей всех четырех ветров\n',
  [FanKind.BIG_THREE_DRAGONS]: 'Панги или конги из костей всех трех драконов\n',
  [FanKind.ALL_GREEN]:
    'Рука, в которой чоу, панги и пара (пары) составлены\n' +
    'исключительно из «зеленых» костей (2, 3, 4, 6, 8 бамбуков и\n' +
    'Зеленый Дракон)',
  [FanKind.NINE_GATES]:
    'Рука содержит кости 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9 в любой одной\n' +
    'масти, создавая девятистороннее ожидание костей 1, 2, 3, 4, 5, 6,\n' +
    '7, 8, 9 (может совмещаться с «Полностью закрытая» при\n' +
    'выигрыше со стены)',
  [FanKind.FOUR_KONGS]: 'Любая рука, включающая четыре конга; они могут быть как закрытыми, так и открытыми',
  [FanKind.SEVEN_SHIFTED_PAIRS]:
    'Рука, составленная из семи пар одной нумерованной масти, где\n' +
    'каждая следующая пара смещена на один номер вверх от\n' +
    'предыдущей (может совмещаться с «Полностью закрытая» при\n' +
    'выигрыше со стены)',
  [FanKind.THIRTEEN_ORPHANS]:
    'Рука, составленная из одиночных костей любых двенадцати из\n' +
    'числа 1, 9 и благородных, а также пары к тринадцатой (может\n' +
    'совмещаться с «Полностью закрытая» при выигрыше со стены)',

  // 64 points
  [FanKind.ALL_TERMINALS]:
    'Пара (пары), панги или конги составлены только из нумерованных костей 1 или 9, без благородных костей',
  [FanKind.LITTLE_FOUR_WINDS]: 'Рука, включающая три Панга или Конга Ветров и одну пару четвертого Ветра',
  [FanKind.LITTLE_THREE_DRAGONS]: 'Рука, включающая два Панга или Конга Драконов и одну пару третьего Дракона',
  [FanKind.ALL_HONORS]: 'Пара (пары), Панги или Конги составлены только из благородных костей',
  [FanKind.FOUR_CONCEALED_PUNGS]:
    'Рука, включающая четыре закрытых панга или конга, собранных\n' +
    'без объявления (может совмещаться с «Полностью закрытая» при\n' +
    'выигрыше со стены)',
  [FanKind.PURE_TERMINAL_CHOWS]:
    'Рука, состоящая из двух пар верхних и нижних терминальных\n' +
    'чоу в одной масти и одной пары пятерок той же масти',

  // 48 points
  [FanKind.QUADRUPLE_CHOW]: 'Четыре чоу одной и той же последовательности в одной масти',
  [FanKind.FOUR_PURE_SHIFTED_PUNGS]:
    'Четыре панга (или конга) одной масти, каждый следующий смещен на один номер вверх от предыдущего',

  // 32 points
  [FanKind.FOUR_PURE_SHIFTED_CHOWS]:
    'Четыре чоу одной масти, каждое следующее смещено на 1 или 2\n' +
    'номера вверх от предыдущего, но без комбинации этих\n' +
    'смещений',
  [FanKind.THREE_KONGS]: 'Рука, содержащая три конга (могут быть добавлены очки за закрытые комбинации)',
  [FanKind.ALL_TERMINALS_AND_HONORS]:
    'Пара (пары), панги или конги – все составлены из нумерованных костей 1 или 9 и благородных костей',

  // 24 points
  [FanKind.SEVEN_PAIRS]:
    'Рука, составленная из семи пар (может совмещаться с «Полностью закрытая» при выигрыше со стены)',
  [FanKind.GREATER_HONORS_AND_KNITTED_TILES]:
    'Составлена из семи одиночных благородных и семи одиночных\n' +
    'нумерованных костей, принадлежащих разным\n' +
    'последовательностям (например, 1-4-7 бамбуков, 2-5-8 символов\n' +
    'и 3-6-9 точек)',
  [FanKind.ALL_EVEN_PUNGS]:
    'Рука, составленная из пангов или конгов нумерованных костей 2, 4, 6, 8 и пары таких же костей',
  [FanKind.FULL_FLUSH]: 'Рука, составленная полностью из костей одной масти',
  [FanKind.PURE_TRIPLE_CHOW]: 'Три чоу одной номерной последовательности в одной масти',
  [FanKind.PURE_SHIFTED_PUNGS]:
    'Три панга или конга одной масти, каждый следующий смещен на один номер вверх от предыдущего',
  [FanKind.UPPER_TILES]: 'Рука, полностью состоящая из нумерованных костей 7, 8 и 9',
  [FanKind.MIDDLE_TILES]: 'Рука, полностью состоящая из нумерованных костей 4, 5 и 6',
  [FanKind.LOWER_TILES]: 'Рука, полностью состоящая из нумерованных костей 1, 2 и 3',

  // 16 points
  [FanKind.PURE_STRAIGHT]:
    'Рука, содержащая по одной кости всех костей одной масти – от 1 до 9, составляющих три последовательных чоу',
  [FanKind.THREE_SUITED_TERMINAL_CHOWS]:
    'Рука, состоящая из костей 1-2-3 и 7-8-9 одной масти (два\n' +
    'терминальных чоу), костей 1-2-3 и 7-8-9 другой масти и пары\n' +
    'пятерок третей масти',
  [FanKind.PURE_SHIFTED_CHOWS]:
    'Три чоу одной масти, каждое следующее смещено на 1 или 2\n' +
    'номера вверх от предыдущего, но без комбинации этих\n' +
    'смещений',
  [FanKind.ALL_FIVES]: 'Рука, в которой каждая комбинация (чоу, панг, конг, пара) содержит нумерованную кость 5',
  [FanKind.TRIPLE_PUNG]: 'Три панга (или конга) из костей одного номера каждой масти',
  [FanKind.THREE_CONCEALED_PUNGS]: 'Три закрытых панга или конга, собранных без объявления',

  // 12 points
  [FanKind.LESSER_HONORS_AND_KNITTED_TILES]:
    'Составлена из одиночных благородных и одиночных\n' +
    'нумерованных костей, принадлежащих разным\n' +
    'последовательностям, например: 1-4-7 бамбуков, 2-5-8 символов\n' +
    'и 3-6-9 точек – кости каждой из трех мастей должны\n' +
    'принадлежать разным последовательностям, но не обязательно в\n' +
    'таком же порядке (может совмещаться с «Полностью закрытая»\n' +
    'при выигрыше со стены)',
  [FanKind.KNITTED_STRAIGHT]:
    'Особый ряд, составленный не из обычных чоу, а из трех\n' +
    'различных последовательностей, например: 1-4-7 точек, 2-5-8\n' +
    'символов и 3-6-9 бамбуков, но не обязательно в таком же\n' +
    'порядке',
  [FanKind.UPPER_FOUR]: 'Рука, составленная из нумерованных костей от 6 до 9',
  [FanKind.LOWER_FOUR]: 'Рука, составленная из нумерованных костей от 1 до 4',
  [FanKind.BIG_THREE_WINDS]: 'Рука, включающая три панга (или конга) ветров',

  // 8 points
  [FanKind.MIXED_STRAIGHT]: 'Ряд (т.е. кости от 1 до 9) составленный из чоу всех трех мастей',
  [FanKind.REVERSIBLE_TILES]:
    'Рука, полностью собранная из вертикально симметричных\n' +
    'костей, т.е. когда изображения на костях выглядят одинаково,\n' +
    'если их перевернуть на 180 градусов. Это кости: 1, 2, 3, 4, 5, 8 и 9\n' +
    'точек, 2, 4, 5, 6, 8 и 9 бамбуков и Белый дракон',
  [FanKind.MIXED_TRIPLE_CHOW]: 'Три чоу одинаковой номерной последовательности, по одному в каждой масти',
  [FanKind.MIXED_SHIFTED_PUNGS]:
    'Три панга (или конга), по одному в каждой масти, каждый следующий смещен на один номер вверх от предыдущего',
  [FanKind.CHICKEN_HAND]: 'Рука, которая должна была бы стоить 0 очков (исключая очки за цветы)',
  [FanKind.LAST_TILE_DRAW]:
    'Выигрыш (составление маджонга) взятием самой последней кости в стене (не совмещается с «Выигрыш со стены»)',
  [FanKind.LAST_TILE_CLAIM]:
    'Выигрыш (составление маджонга) взятием снесенной кости, которая является последней в игре',
  [FanKind.OUT_WITH_REPLACEMENT_TILE]:
    'Выигрыш (составление маджонга) взятием замещающей кости после составления конга (но не замещения цветка)',
  [FanKind.ROBBING_THE_KONG]:
    'Выигрыш с помощью кости, которую кто-либо добавил к\n' +
    'открытому пангу, чтобы создать конг (не может быть совмещено\n' +
    'с очками за «Последняя кость»)',
  [FanKind.TWO_CONCEALED_KONGS]: 'Рука, которая содержит два закрытых конга',

  // 6 points
  [FanKind.ALL_PUNGS]: 'Рука, составленная из четырех пангов (или конгов) и одной пары',
  [FanKind.HALF_FLUSH]: 'Рука, составленная из любой из трех мастей в комбинации с благородными костями',
  [FanKind.MIXED_SHIFTED_CHOWS]:
    'Три чоу, по одной в каждой масти, каждое следующее смещено на один номер вверх от предыдущего',
  [FanKind.ALL_TYPES]: 'Рука, составленная из всех типов костей (символов, бамбуков, точек, ветров и драконов)',
  [FanKind.MELDED_HAND]:
    'Все комбинации в руке (чоу, панг, конг и пара) должны быть\n' +
    'созданы с помощью костей, снесенных другими игроками. Все\n' +
    'комбинации должны быть открытыми, а игрок должен выиграть\n' +
    'единственно возможной костью, снесенной другим игроком',
  [FanKind.TWO_DRAGON_PUNGS]: 'Два панга (или конга) костей драконов',

  // 4 points
  [FanKind.OUTSIDE_HAND]: 'Рука, которая содержит терминальные и благородные кости в каждой комбинации, включая пару',
  [FanKind.FULLY_CONCEALED_HAND]:
    'Рука, которую игрок завершает без единого объявления, и выигрывает взятием кости со стены',
  [FanKind.TWO_MELDED_KONGS]:
    'Рука, которая содержит два открытых конга. Один открытый конг и один закрытый конг дают 6 очков',
  [FanKind.LAST_TILE]:
    'Выигрыш с помощью кости, которая является последней из\n' +
    'четырех в своем роде (это должно быть очевидно для всех\n' +
    'игроков, основываясь на снесенных и открытых костях)',

  // 2 points
  [FanKind.DRAGON_PUNG]: 'Панг или конг из костей драконов',
  [FanKind.PREVALENT_WIND]: 'Панг или конг из костей ветра, соответствующего текущему ветру раунда',
  [FanKind.SEAT_WIND]:
    'Панг или конг из костей ветра, соответствующего месту игрока за\n' +
    'столом (разыгрывающий – Восток, и далее, против часовой\n' +
    'стрелки от разыгрывающего, места других игроков: Юг, Запад,\n' +
    'Север)',
  [FanKind.CONCEALED_HAND]: 'Закрытая рука (нет ни одной открытой комбинации) при выигрыше с помощью снесенной кости',
  [FanKind.ALL_CHOWS]: 'Рука, состоящая только из чоу, без благородных костей',
  [FanKind.TILE_HOG]: 'Имеются все четыре одинаковые кости, не составленные в конг',
  [FanKind.DOUBLE_PUNG]: 'Два панга (или конга) одного номера в разных мастях',
  [FanKind.TWO_CONCEALED_PUNGS]: 'Два панга, собранных без объявления',
  [FanKind.CONCEALED_KONG]: 'Конг, составленный из костей, взятых со стены, и объявленный как конг',
  [FanKind.ALL_SIMPLES]: 'Рука, составленная без использования терминальных и благородных костей',

  // 1 point
  [FanKind.PURE_DOUBLE_CHOW]: 'Два идентичных чоу в одной масти',
  [FanKind.MIXED_DOUBLE_CHOW]: 'Два чоу из одинаковых номеров, но в разных мастях',
  [FanKind.SHORT_STRAIGHT]:
    'Два чоу в одной масти, которые продолжают друг друга, создавая последовательный ряд из шести костей',
  [FanKind.TWO_TERMINAL_CHOWS]: 'Чоу из костей 1-2-3 и 7-8-9 одной масти',
  [FanKind.PUNG_OF_TERMINALS_OR_HONORS]: 'Панг или конг единиц, девяток или ветров (панг драконов дает 2 очка)',
  [FanKind.MELDED_KONG]: 'Конг, созданный с помощью снесенной кости другого игрока, или созданный из открытого панга',
  [FanKind.ONE_VOIDED_SUIT]:
    'Рука, в которой использованы только две из трех мастей (т.е. не содержит костей одной из трех мастей)',
  [FanKind.NO_HONORS]: 'Рука, составленная полностью из номерных костей, без ветров и драконов',
  [FanKind.EDGE_WAIT]:
    'Ожидание 3, чтобы составить чоу 1-2-3 или 7, чтобы составить\n' +
    'чоу 7-8-9. Не засчитывается, если ожидается более одной кости.\n' +
    'Не засчитывается, если совмещено с другим типом ожидания',
  [FanKind.CLOSED_WAIT]:
    'Ожидание кости, чей номер находится «внутри» (в середине)\n' +
    'ожидаемого чоу. Не засчитывается, если ожидается более одной\n' +
    'кости. Не засчитывается, если совмещено с другим типом\n' +
    'ожидания',
  [FanKind.SINGLE_WAIT]:
    'Ожидание кости для составления пары. Не засчитывается, если\n' +
    'ожидается более одной кости (например, имеется 1-2-3-4 и\n' +
    'ожидается 1 или 4)',
  [FanKind.SELF_DRAWN]: 'Выигрыш (объявление маджонга) с помощью новой кости, взятой со стены',
  [FanKind.FLOWER_TILES]:
    'Каждая кость, на которой изображено китайское слово «Весна»\n' +
    '(или «Лето», «Осень», «Зима», «Вишня», «Орхидея», «Бамбук»,\n' +
    '«Хризантема») принесет вам одно очко, если вы выиграете',
};

export const FAN_EXAMPLES: Record<FanKind, Tile[][][]> = {
  // 88 points
  [FanKind.BIG_FOUR_WINDS]: [parsePlayableTileSets('WeWeWe WsWsWs WwWwWw WnWnWn')],
  [FanKind.BIG_THREE_DRAGONS]: [parsePlayableTileSets('DrDrDr DgDgDg DwDwDw')],
  [FanKind.ALL_GREEN]: [
    parsePlayableTileSets('b2b3b4 b2b3b4 b2b3b4 b6b6b6 b8b8'),
    parsePlayableTileSets('b2b2 b3b3 b3b3 b4b4 b4b4 b6b6 DgDg'),
  ],
  [FanKind.NINE_GATES]: [parsePlayableTileSets('d1d1d1d2d3d4d5d6d7d8d9d9d9')],
  [FanKind.FOUR_KONGS]: [parsePlayableTileSets('b1b1b1b1 c6c6c6c6 d8d8d8d8 DgDgDgDg')],
  [FanKind.SEVEN_SHIFTED_PAIRS]: [parsePlayableTileSets('c2c2 c3c3 c4c4 c5c5 c6c6 c7c7 c8c8')],
  [FanKind.THIRTEEN_ORPHANS]: [parsePlayableTileSets('b1b9c1c9d1d9WeWsWwWnDrDgDwb1')],

  // 64 points
  [FanKind.ALL_TERMINALS]: [parsePlayableTileSets('b1b1b1 b9b9b9b9 c1c1c1 d9d9d9 c9c9')],
  [FanKind.LITTLE_FOUR_WINDS]: [parsePlayableTileSets('WeWeWe WwWwWw WnWnWn WsWs')],
  [FanKind.LITTLE_THREE_DRAGONS]: [parsePlayableTileSets('DgDgDg DwDwDw DrDr')],
  [FanKind.ALL_HONORS]: [parsePlayableTileSets('WeWeWe WwWwWw WnWnWn DrDrDr DwDw')],
  [FanKind.FOUR_CONCEALED_PUNGS]: [],
  [FanKind.PURE_TERMINAL_CHOWS]: [parsePlayableTileSets('b1b2b3 b1b2b3 b7b8b9 b7b8b9 b5b5')],

  // 48 points
  [FanKind.QUADRUPLE_CHOW]: [parsePlayableTileSets('d2d3d4 d2d3d4 d2d3d4 d2d3d4')],
  [FanKind.FOUR_PURE_SHIFTED_PUNGS]: [parsePlayableTileSets('c5c5c5 c6c6c6 c7c7c7 c8c8c8')],

  // 32 points
  [FanKind.FOUR_PURE_SHIFTED_CHOWS]: [
    parsePlayableTileSets('c1c2c3 c2c3c4 c3c4c5 c4c5c6'),
    parsePlayableTileSets('b1b2b3 b3b4b5 b5b6b7 b7b8b9'),
  ],
  [FanKind.THREE_KONGS]: [parsePlayableTileSets('b1b1b1b1 c6c6c6c6 d8d8d8d8')],
  [FanKind.ALL_TERMINALS_AND_HONORS]: [parsePlayableTileSets('c1c1c1 d1d1d1 d9d9d9 WnWnWn DgDg')],

  // 24 points
  [FanKind.SEVEN_PAIRS]: [parsePlayableTileSets('c1c1 b7b7 d8d8 d9d9 WwWw WwWw DwDw')],
  [FanKind.GREATER_HONORS_AND_KNITTED_TILES]: [
    parsePlayableTileSets('d1d4d7b2b5b8c6WeWsWwWnDrDgDw'),
    parsePlayableTileSets('c1c4d2d5d8b3b9WeWsWwWnDrDgDw'),
  ],
  [FanKind.ALL_EVEN_PUNGS]: [parsePlayableTileSets('b2b2b2 b8b8b8 c6c6c6 d4d4d4 d8d8')],
  [FanKind.FULL_FLUSH]: [parsePlayableTileSets('b1b2b3 b3b4b5 b7b7b7 b8b8b8 b9b9')],
  [FanKind.PURE_TRIPLE_CHOW]: [parsePlayableTileSets('c3c4c5 c3c4c5 c3c4c5')],
  [FanKind.PURE_SHIFTED_PUNGS]: [parsePlayableTileSets('d3d3d3 d4d4d4 d5d5d5')],
  [FanKind.UPPER_TILES]: [parsePlayableTileSets('b7b7b7 c7c7c7 d7d8d9 c7c8c9 b9b9')],
  [FanKind.MIDDLE_TILES]: [parsePlayableTileSets('b4b4b4 b5b5b5 d6d6d6 d4d5d6 c6c6')],
  [FanKind.LOWER_TILES]: [parsePlayableTileSets('c1c1c1 b2b2b2 d2d2d2 d1d1d1 c3c3')],

  // 16 points
  [FanKind.PURE_STRAIGHT]: [
    parsePlayableTileSets('c1c2c3 c4c5c6 c7c8c9'),
    parsePlayableTileSets('d1d2d3 d4d5d6 d7d8d9'),
  ],
  [FanKind.THREE_SUITED_TERMINAL_CHOWS]: [parsePlayableTileSets('b1b2b3 b7b8b9 c1c2c3 c7c8c9 d5d5')],
  [FanKind.PURE_SHIFTED_CHOWS]: [
    parsePlayableTileSets('c1c2c3 c2c3c4 c3c4c5'),
    parsePlayableTileSets('b1b2b3 b3b4b5 b5b6b7'),
  ],
  [FanKind.ALL_FIVES]: [parsePlayableTileSets('b4b5b6 b5b5b5 c5c6c7 d3d4d5 d5d5')],
  [FanKind.TRIPLE_PUNG]: [parsePlayableTileSets('b5b5b5 c5c5c5 d5d5d5')],
  [FanKind.THREE_CONCEALED_PUNGS]: [],

  // 12 points
  [FanKind.LESSER_HONORS_AND_KNITTED_TILES]: [
    parsePlayableTileSets('b1b4b7c2c5c8d3d6WeWsWwDrDgDw'),
    parsePlayableTileSets('d1d4d7b2b5b8c3c6c9WsWwWnDgDw'),
  ],
  [FanKind.KNITTED_STRAIGHT]: [
    parsePlayableTileSets('b1b4b7 d2d5d8 c3c6c9'),
    parsePlayableTileSets('c1c4c7 b2b5b8 d3d6d9'),
  ],
  [FanKind.UPPER_FOUR]: [parsePlayableTileSets('b6b6b6 c6c7c8 d7d8d9 d9d9d9 c7c7')],
  [FanKind.LOWER_FOUR]: [parsePlayableTileSets('d1d1d1 d1d2d3 c4c4c4 b4b4b4 b2b2')],
  [FanKind.BIG_THREE_WINDS]: [parsePlayableTileSets('WeWeWe WwWwWw WnWnWn')],

  // 8 points
  [FanKind.MIXED_STRAIGHT]: [parsePlayableTileSets('b1b2b3 c4c5c6 d7d8d9')],
  [FanKind.REVERSIBLE_TILES]: [parsePlayableTileSets('d1d2d3 d8d8d8 b4b5b6 b9b9b9 DwDw')],
  [FanKind.MIXED_TRIPLE_CHOW]: [parsePlayableTileSets('c2c3c4 b2b3b4 d2d3d4')],
  [FanKind.MIXED_SHIFTED_PUNGS]: [parsePlayableTileSets('b7b7b7 c8c8c8 d9d9d9')],
  [FanKind.CHICKEN_HAND]: [],
  [FanKind.LAST_TILE_DRAW]: [],
  [FanKind.LAST_TILE_CLAIM]: [],
  [FanKind.OUT_WITH_REPLACEMENT_TILE]: [],
  [FanKind.ROBBING_THE_KONG]: [],
  [FanKind.TWO_CONCEALED_KONGS]: [],

  // 6 points
  [FanKind.ALL_PUNGS]: [parsePlayableTileSets('c1c1c1 b6b6b6 b8b8b8 DrDrDr d8d8')],
  [FanKind.HALF_FLUSH]: [parsePlayableTileSets('DgDgDg b2b3b4 b8b8b8 b7b8b9 b5b5')],
  [FanKind.MIXED_SHIFTED_CHOWS]: [parsePlayableTileSets('c1c2c3 d2d3d4 b3b4b5')],
  [FanKind.ALL_TYPES]: [parsePlayableTileSets('c1c2c3 b6b6b6 d8d8d8 DwDwDw WeWe')],
  [FanKind.MELDED_HAND]: [],
  [FanKind.TWO_DRAGON_PUNGS]: [parsePlayableTileSets('DrDrDr DgDgDg')],

  // 4 points
  [FanKind.OUTSIDE_HAND]: [parsePlayableTileSets('c1c2c3 c1c1c1 b1b1b1 d7d8d9 DrDr')],
  [FanKind.FULLY_CONCEALED_HAND]: [],
  [FanKind.TWO_MELDED_KONGS]: [],
  [FanKind.LAST_TILE]: [],

  // 2 points
  [FanKind.DRAGON_PUNG]: [parsePlayableTileSets('DrDrDr')],
  [FanKind.PREVALENT_WIND]: [],
  [FanKind.SEAT_WIND]: [],
  [FanKind.CONCEALED_HAND]: [],
  [FanKind.ALL_CHOWS]: [parsePlayableTileSets('c2c3c4 d3d4d5 b4b5b6 b7b8b9 d7d7')],
  [FanKind.TILE_HOG]: [parsePlayableTileSets('d7d7d7 d7d8d9'), parsePlayableTileSets('c7c7 c7c7')],
  [FanKind.DOUBLE_PUNG]: [parsePlayableTileSets('b5b5b5 d5d5d5')],
  [FanKind.TWO_CONCEALED_PUNGS]: [],
  [FanKind.CONCEALED_KONG]: [],
  [FanKind.ALL_SIMPLES]: [parsePlayableTileSets('c2c3c4 d3d4d5 b4b5b6 b6b6b6 b4b4')],

  // 1 point
  [FanKind.PURE_DOUBLE_CHOW]: [parsePlayableTileSets('c1c2c3 c1c2c3')],
  [FanKind.MIXED_DOUBLE_CHOW]: [parsePlayableTileSets('c1c2c3 d1d2d3')],
  [FanKind.SHORT_STRAIGHT]: [parsePlayableTileSets('d3d4d5 d6d7d8')],
  [FanKind.TWO_TERMINAL_CHOWS]: [parsePlayableTileSets('b1b2b3 b7b8b9')],
  [FanKind.PUNG_OF_TERMINALS_OR_HONORS]: [parsePlayableTileSets('d1d1d1'), parsePlayableTileSets('WsWsWs')],
  [FanKind.MELDED_KONG]: [],
  [FanKind.ONE_VOIDED_SUIT]: [parsePlayableTileSets('b1b1b1 b7b7b7 b8b8b8 DgDgDg d6d6')],
  [FanKind.NO_HONORS]: [parsePlayableTileSets('b2b2b2 b3b3b3 b4b4b4 d5d5d5 c9c9')],
  [FanKind.EDGE_WAIT]: [parsePlayableTileSets('b1b2 b3')],
  [FanKind.CLOSED_WAIT]: [parsePlayableTileSets('d4d6 d5')],
  [FanKind.SINGLE_WAIT]: [],
  [FanKind.SELF_DRAWN]: [],
  [FanKind.FLOWER_TILES]: [],
};
