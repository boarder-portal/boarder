import { EFan, TTile } from 'common/types/mahjong';

import { parsePlayableTileSets } from 'common/utilities/mahjong/parse';

export const FANS = Object.values(EFan);

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
  [EFan.QUADRUPLE_CHOW]: 48,
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

export const NO_SETS_FANS = [
  EFan.THIRTEEN_ORPHANS,
  EFan.GREATER_HONORS_AND_KNITTED_TILES,
  EFan.LESSER_HONORS_AND_KNITTED_TILES,
];

export const IMPLIED_FANS: Partial<Record<EFan, EFan[]>> = {
  // 88 points
  [EFan.BIG_FOUR_WINDS]: [
    EFan.BIG_THREE_WINDS,
    EFan.ALL_PUNGS,
    EFan.SEAT_WIND,
    EFan.PREVALENT_WIND,
    EFan.PUNG_OF_TERMINALS_OR_HONORS,
  ],
  [EFan.BIG_THREE_DRAGONS]: [EFan.TWO_DRAGON_PUNGS, EFan.DRAGON_PUNG, EFan.PUNG_OF_TERMINALS_OR_HONORS],
  [EFan.NINE_GATES]: [EFan.FULL_FLUSH, EFan.CONCEALED_HAND, EFan.PUNG_OF_TERMINALS_OR_HONORS, EFan.NO_HONORS],
  [EFan.FOUR_KONGS]: [
    EFan.THREE_KONGS,
    EFan.TWO_CONCEALED_KONGS,
    EFan.TWO_MELDED_KONGS,
    EFan.CONCEALED_KONG,
    EFan.MELDED_KONG,
    EFan.ALL_PUNGS,
    EFan.SINGLE_WAIT,
  ],
  [EFan.SEVEN_SHIFTED_PAIRS]: [
    EFan.SEVEN_PAIRS,
    EFan.FULL_FLUSH,
    EFan.CONCEALED_HAND,
    EFan.SINGLE_WAIT,
    EFan.NO_HONORS,
  ],
  [EFan.THIRTEEN_ORPHANS]: [EFan.ALL_TYPES, EFan.ALL_TERMINALS_AND_HONORS, EFan.CONCEALED_HAND, EFan.SINGLE_WAIT],

  // 64 points
  [EFan.ALL_TERMINALS]: [
    EFan.ALL_TERMINALS_AND_HONORS,
    EFan.ALL_PUNGS,
    EFan.OUTSIDE_HAND,
    EFan.PUNG_OF_TERMINALS_OR_HONORS,
    EFan.NO_HONORS,
  ],
  [EFan.LITTLE_FOUR_WINDS]: [EFan.BIG_THREE_WINDS, EFan.PUNG_OF_TERMINALS_OR_HONORS],
  [EFan.LITTLE_THREE_DRAGONS]: [EFan.TWO_DRAGON_PUNGS, EFan.DRAGON_PUNG, EFan.PUNG_OF_TERMINALS_OR_HONORS],
  [EFan.ALL_HONORS]: [
    EFan.ALL_TERMINALS_AND_HONORS,
    EFan.ALL_PUNGS,
    EFan.PUNG_OF_TERMINALS_OR_HONORS,
    EFan.OUTSIDE_HAND,
  ],
  [EFan.FOUR_CONCEALED_PUNGS]: [
    EFan.ALL_PUNGS,
    EFan.THREE_CONCEALED_PUNGS,
    EFan.TWO_CONCEALED_PUNGS,
    EFan.CONCEALED_HAND,
  ],
  [EFan.PURE_TERMINAL_CHOWS]: [
    EFan.FULL_FLUSH,
    EFan.ALL_CHOWS,
    EFan.PURE_DOUBLE_CHOW,
    EFan.TWO_TERMINAL_CHOWS,
    EFan.NO_HONORS,
  ],

  // 48 points
  [EFan.QUADRUPLE_CHOW]: [EFan.PURE_TRIPLE_CHOW, EFan.PURE_DOUBLE_CHOW, EFan.TILE_HOG],
  [EFan.FOUR_PURE_SHIFTED_PUNGS]: [EFan.PURE_SHIFTED_PUNGS, EFan.ALL_PUNGS],

  // 32 points
  [EFan.FOUR_PURE_SHIFTED_CHOWS]: [EFan.PURE_SHIFTED_CHOWS, EFan.SHORT_STRAIGHT, EFan.TWO_TERMINAL_CHOWS],
  [EFan.THREE_KONGS]: [EFan.TWO_CONCEALED_KONGS, EFan.TWO_MELDED_KONGS, EFan.CONCEALED_KONG, EFan.MELDED_KONG],
  [EFan.ALL_TERMINALS_AND_HONORS]: [EFan.PUNG_OF_TERMINALS_OR_HONORS, EFan.ALL_PUNGS, EFan.OUTSIDE_HAND],

  // 24 points
  [EFan.SEVEN_PAIRS]: [EFan.CONCEALED_HAND, EFan.SINGLE_WAIT],
  [EFan.GREATER_HONORS_AND_KNITTED_TILES]: [EFan.ALL_TYPES, EFan.CONCEALED_HAND],
  [EFan.ALL_EVEN_PUNGS]: [EFan.ALL_PUNGS, EFan.NO_HONORS, EFan.ALL_SIMPLES],
  [EFan.FULL_FLUSH]: [EFan.NO_HONORS],
  [EFan.PURE_TRIPLE_CHOW]: [EFan.PURE_DOUBLE_CHOW],
  [EFan.UPPER_TILES]: [EFan.UPPER_FOUR, EFan.NO_HONORS],
  [EFan.MIDDLE_TILES]: [EFan.ALL_SIMPLES, EFan.NO_HONORS],
  [EFan.LOWER_TILES]: [EFan.LOWER_FOUR, EFan.NO_HONORS],

  // 16 points
  [EFan.PURE_STRAIGHT]: [EFan.SHORT_STRAIGHT, EFan.TWO_TERMINAL_CHOWS],
  [EFan.THREE_SUITED_TERMINAL_CHOWS]: [EFan.TWO_TERMINAL_CHOWS, EFan.ALL_CHOWS, EFan.NO_HONORS, EFan.MIXED_DOUBLE_CHOW],
  [EFan.ALL_FIVES]: [EFan.ALL_SIMPLES, EFan.NO_HONORS],
  [EFan.TRIPLE_PUNG]: [EFan.DOUBLE_PUNG],
  [EFan.THREE_CONCEALED_PUNGS]: [EFan.TWO_CONCEALED_PUNGS],

  // 12 points
  [EFan.LESSER_HONORS_AND_KNITTED_TILES]: [EFan.ALL_TYPES, EFan.CONCEALED_HAND],
  [EFan.UPPER_FOUR]: [EFan.NO_HONORS],
  [EFan.LOWER_FOUR]: [EFan.NO_HONORS],
  [EFan.BIG_THREE_WINDS]: [EFan.PUNG_OF_TERMINALS_OR_HONORS],

  // 8 points
  [EFan.REVERSIBLE_TILES]: [EFan.ONE_VOIDED_SUIT],
  [EFan.MIXED_TRIPLE_CHOW]: [EFan.MIXED_DOUBLE_CHOW],
  [EFan.LAST_TILE_DRAW]: [EFan.SELF_DRAWN],
  [EFan.OUT_WITH_REPLACEMENT_TILE]: [EFan.SELF_DRAWN],
  [EFan.ROBBING_THE_KONG]: [EFan.LAST_TILE],
  [EFan.TWO_CONCEALED_KONGS]: [EFan.TWO_CONCEALED_PUNGS, EFan.CONCEALED_KONG],

  // 6 points
  [EFan.MELDED_HAND]: [EFan.SINGLE_WAIT],
  [EFan.TWO_DRAGON_PUNGS]: [EFan.DRAGON_PUNG, EFan.PUNG_OF_TERMINALS_OR_HONORS],

  // 4 points
  [EFan.FULLY_CONCEALED_HAND]: [EFan.CONCEALED_HAND, EFan.SELF_DRAWN],
  [EFan.TWO_MELDED_KONGS]: [EFan.MELDED_KONG],

  // 2 points
  [EFan.DRAGON_PUNG]: [EFan.PUNG_OF_TERMINALS_OR_HONORS],
  [EFan.PREVALENT_WIND]: [EFan.PUNG_OF_TERMINALS_OR_HONORS],
  [EFan.SEAT_WIND]: [EFan.PUNG_OF_TERMINALS_OR_HONORS],
  [EFan.ALL_CHOWS]: [EFan.NO_HONORS],
  [EFan.ALL_SIMPLES]: [EFan.NO_HONORS],
};

export const FAN_NAMES: Record<EFan, string> = {
  // 88 points
  [EFan.BIG_FOUR_WINDS]: 'Большие четыре ветра',
  [EFan.BIG_THREE_DRAGONS]: 'Большие три дракона',
  [EFan.ALL_GREEN]: 'Все зеленые',
  [EFan.NINE_GATES]: 'Девять врат',
  [EFan.FOUR_KONGS]: 'Четыре конга',
  [EFan.SEVEN_SHIFTED_PAIRS]: 'Семь смещенных пар',
  [EFan.THIRTEEN_ORPHANS]: 'Тринадцать сирот',

  // 64 points
  [EFan.ALL_TERMINALS]: 'Все терминальные',
  [EFan.LITTLE_FOUR_WINDS]: 'Малые четыре ветра',
  [EFan.LITTLE_THREE_DRAGONS]: 'Малые три дракона',
  [EFan.ALL_HONORS]: 'Все благородные',
  [EFan.FOUR_CONCEALED_PUNGS]: 'Четыре закрытых панга',
  [EFan.PURE_TERMINAL_CHOWS]: 'Чистые терминальные чоу',

  // 48 points
  [EFan.QUADRUPLE_CHOW]: 'Четверное чоу',
  [EFan.FOUR_PURE_SHIFTED_PUNGS]: 'Четыре чистых смещенных панга',

  // 32 points
  [EFan.FOUR_PURE_SHIFTED_CHOWS]: 'Четыре чистых смещенных чоу',
  [EFan.THREE_KONGS]: 'Три конга',
  [EFan.ALL_TERMINALS_AND_HONORS]: 'Все терминальные и благородные',

  // 24 points
  [EFan.SEVEN_PAIRS]: 'Семь пар',
  [EFan.GREATER_HONORS_AND_KNITTED_TILES]: 'Большие благородные и переплетенные кости',
  [EFan.ALL_EVEN_PUNGS]: 'Все четные панги',
  [EFan.FULL_FLUSH]: 'Полное изобилие',
  [EFan.PURE_TRIPLE_CHOW]: 'Чистое тройное чоу',
  [EFan.PURE_SHIFTED_PUNGS]: 'Чистые смещенные панги',
  [EFan.UPPER_TILES]: 'Верхние кости',
  [EFan.MIDDLE_TILES]: 'Средние кости',
  [EFan.LOWER_TILES]: 'Нижние кости',

  // 16 points
  [EFan.PURE_STRAIGHT]: 'Чистый ряд',
  [EFan.THREE_SUITED_TERMINAL_CHOWS]: 'Три масти и терминальные чоу',
  [EFan.PURE_SHIFTED_CHOWS]: 'Чистые смещенные чоу',
  [EFan.ALL_FIVES]: 'Все пятерки',
  [EFan.TRIPLE_PUNG]: 'Тройной панг',
  [EFan.THREE_CONCEALED_PUNGS]: 'Три закрытых панга',

  // 12 points
  [EFan.LESSER_HONORS_AND_KNITTED_TILES]: 'Малые благородные и переплетенные кости',
  [EFan.KNITTED_STRAIGHT]: 'Переплетенный ряд',
  [EFan.UPPER_FOUR]: 'Четыре верхних',
  [EFan.LOWER_FOUR]: 'Четыре нижних',
  [EFan.BIG_THREE_WINDS]: 'Большие три ветра',

  // 8 points
  [EFan.MIXED_STRAIGHT]: 'Смешанный ряд',
  [EFan.REVERSIBLE_TILES]: 'Симметричные кости',
  [EFan.MIXED_TRIPLE_CHOW]: 'Смешанное тройное чоу',
  [EFan.MIXED_SHIFTED_PUNGS]: 'Смешанные смещенные панги',
  [EFan.CHICKEN_HAND]: 'Цыплячья рука',
  [EFan.LAST_TILE_DRAW]: 'Последняя кость со стены',
  [EFan.LAST_TILE_CLAIM]: 'Последний снос',
  [EFan.OUT_WITH_REPLACEMENT_TILE]: 'Выигрыш замещающей костью',
  [EFan.ROBBING_THE_KONG]: 'Ограбление конга',
  [EFan.TWO_CONCEALED_KONGS]: 'Два закрытых конга',

  // 6 points
  [EFan.ALL_PUNGS]: 'Все панги',
  [EFan.HALF_FLUSH]: 'Пол-изобилия',
  [EFan.MIXED_SHIFTED_CHOWS]: 'Смешанные смещенные чоу',
  [EFan.ALL_TYPES]: 'Все типы',
  [EFan.MELDED_HAND]: 'Открытая рука',
  [EFan.TWO_DRAGON_PUNGS]: 'Два панга драконов',

  // 4 points
  [EFan.OUTSIDE_HAND]: 'Внешняя рука',
  [EFan.FULLY_CONCEALED_HAND]: 'Полностью закрытая рука',
  [EFan.TWO_MELDED_KONGS]: 'Два открытых конга',
  [EFan.LAST_TILE]: 'Последняя кость',

  // 2 points
  [EFan.DRAGON_PUNG]: 'Панг драконов',
  [EFan.PREVALENT_WIND]: 'Преимущественный ветер',
  [EFan.SEAT_WIND]: 'Ветер места',
  [EFan.CONCEALED_HAND]: 'Закрытая рука',
  [EFan.ALL_CHOWS]: 'Все чоу',
  [EFan.TILE_HOG]: 'Четыре врозь',
  [EFan.DOUBLE_PUNG]: 'Двойной панг',
  [EFan.TWO_CONCEALED_PUNGS]: 'Два закрытых панга',
  [EFan.CONCEALED_KONG]: 'Закрытый конг',
  [EFan.ALL_SIMPLES]: 'Все простые',

  // 1 point
  [EFan.PURE_DOUBLE_CHOW]: 'Чистое двойное чоу',
  [EFan.MIXED_DOUBLE_CHOW]: 'Смешанное двойное чоу',
  [EFan.SHORT_STRAIGHT]: 'Короткий ряд',
  [EFan.TWO_TERMINAL_CHOWS]: 'Два терминальных чоу',
  [EFan.PUNG_OF_TERMINALS_OR_HONORS]: 'Панг терминальных или благородных',
  [EFan.MELDED_KONG]: 'Открытый конг',
  [EFan.ONE_VOIDED_SUIT]: 'Пропущенная масть',
  [EFan.NO_HONORS]: 'Без благородных',
  [EFan.EDGE_WAIT]: 'Крайнее ожидание',
  [EFan.CLOSED_WAIT]: 'Закрытое ожидание',
  [EFan.SINGLE_WAIT]: 'Ожидание единственной',
  [EFan.SELF_DRAWN]: 'Выигрыш со стены',
  [EFan.FLOWER_TILES]: 'Цветок',
};

export const FAN_DESCRIPTIONS: Record<EFan, string> = {
  // 88 points
  [EFan.BIG_FOUR_WINDS]: 'Панги или конги из костей всех четырех ветров\n',
  [EFan.BIG_THREE_DRAGONS]: 'Панги или конги из костей всех трех драконов\n',
  [EFan.ALL_GREEN]:
    'Рука, в которой чоу, панги и пара (пары) составлены\n' +
    'исключительно из «зеленых» костей (2, 3, 4, 6, 8 бамбуков и\n' +
    'Зеленый Дракон)',
  [EFan.NINE_GATES]:
    'Рука содержит кости 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9 в любой одной\n' +
    'масти, создавая девятистороннее ожидание костей 1, 2, 3, 4, 5, 6,\n' +
    '7, 8, 9 (может совмещаться с «Полностью закрытая» при\n' +
    'выигрыше со стены)',
  [EFan.FOUR_KONGS]: 'Любая рука, включающая четыре конга; они могут быть как закрытыми, так и открытыми',
  [EFan.SEVEN_SHIFTED_PAIRS]:
    'Рука, составленная из семи пар одной нумерованной масти, где\n' +
    'каждая следующая пара смещена на один номер вверх от\n' +
    'предыдущей (может совмещаться с «Полностью закрытая» при\n' +
    'выигрыше со стены)',
  [EFan.THIRTEEN_ORPHANS]:
    'Рука, составленная из одиночных костей любых двенадцати из\n' +
    'числа 1, 9 и благородных, а также пары к тринадцатой (может\n' +
    'совмещаться с «Полностью закрытая» при выигрыше со стены)',

  // 64 points
  [EFan.ALL_TERMINALS]:
    'Пара (пары), панги или конги составлены только из нумерованных костей 1 или 9, без благородных костей',
  [EFan.LITTLE_FOUR_WINDS]: 'Рука, включающая три Панга или Конга Ветров и одну пару четвертого Ветра',
  [EFan.LITTLE_THREE_DRAGONS]: 'Рука, включающая два Панга или Конга Драконов и одну пару третьего Дракона',
  [EFan.ALL_HONORS]: 'Пара (пары), Панги или Конги составлены только из благородных костей',
  [EFan.FOUR_CONCEALED_PUNGS]:
    'Рука, включающая четыре закрытых панга или конга, собранных\n' +
    'без объявления (может совмещаться с «Полностью закрытая» при\n' +
    'выигрыше со стены)',
  [EFan.PURE_TERMINAL_CHOWS]:
    'Рука, состоящая из двух пар верхних и нижних терминальных\n' +
    'чоу в одной масти и одной пары пятерок той же масти',

  // 48 points
  [EFan.QUADRUPLE_CHOW]: 'Четыре чоу одной и той же последовательности в одной масти',
  [EFan.FOUR_PURE_SHIFTED_PUNGS]:
    'Четыре панга (или конга) одной масти, каждый следующий смещен на один номер вверх от предыдущего',

  // 32 points
  [EFan.FOUR_PURE_SHIFTED_CHOWS]:
    'Четыре чоу одной масти, каждое следующее смещено на 1 или 2\n' +
    'номера вверх от предыдущего, но без комбинации этих\n' +
    'смещений',
  [EFan.THREE_KONGS]: 'Рука, содержащая три конга (могут быть добавлены очки за закрытые комбинации)',
  [EFan.ALL_TERMINALS_AND_HONORS]:
    'Пара (пары), панги или конги – все составлены из нумерованных костей 1 или 9 и благородных костей',

  // 24 points
  [EFan.SEVEN_PAIRS]: 'Рука, составленная из семи пар (может совмещаться с «Полностью закрытая» при выигрыше со стены)',
  [EFan.GREATER_HONORS_AND_KNITTED_TILES]:
    'Составлена из семи одиночных благородных и семи одиночных\n' +
    'нумерованных костей, принадлежащих разным\n' +
    'последовательностям (например, 1-4-7 бамбуков, 2-5-8 символов\n' +
    'и 3-6-9 точек)',
  [EFan.ALL_EVEN_PUNGS]:
    'Рука, составленная из пангов или конгов нумерованных костей 2, 4, 6, 8 и пары таких же костей',
  [EFan.FULL_FLUSH]: 'Рука, составленная полностью из костей одной масти',
  [EFan.PURE_TRIPLE_CHOW]: 'Три чоу одной номерной последовательности в одной масти',
  [EFan.PURE_SHIFTED_PUNGS]:
    'Три панга или конга одной масти, каждый следующий смещен на один номер вверх от предыдущего',
  [EFan.UPPER_TILES]: 'Рука, полностью состоящая из нумерованных костей 7, 8 и 9',
  [EFan.MIDDLE_TILES]: 'Рука, полностью состоящая из нумерованных костей 4, 5 и 6',
  [EFan.LOWER_TILES]: 'Рука, полностью состоящая из нумерованных костей 1, 2 и 3',

  // 16 points
  [EFan.PURE_STRAIGHT]:
    'Рука, содержащая по одной кости всех костей одной масти – от 1 до 9, составляющих три последовательных чоу',
  [EFan.THREE_SUITED_TERMINAL_CHOWS]:
    'Рука, состоящая из костей 1-2-3 и 7-8-9 одной масти (два\n' +
    'терминальных чоу), костей 1-2-3 и 7-8-9 другой масти и пары\n' +
    'пятерок третей масти',
  [EFan.PURE_SHIFTED_CHOWS]:
    'Три чоу одной масти, каждое следующее смещено на 1 или 2\n' +
    'номера вверх от предыдущего, но без комбинации этих\n' +
    'смещений',
  [EFan.ALL_FIVES]: 'Рука, в которой каждая комбинация (чоу, панг, конг, пара) содержит нумерованную кость 5',
  [EFan.TRIPLE_PUNG]: 'Три панга (или конга) из костей одного номера каждой масти',
  [EFan.THREE_CONCEALED_PUNGS]: 'Три закрытых панга или конга, собранных без объявления',

  // 12 points
  [EFan.LESSER_HONORS_AND_KNITTED_TILES]:
    'Составлена из одиночных благородных и одиночных\n' +
    'нумерованных костей, принадлежащих разным\n' +
    'последовательностям, например: 1-4-7 бамбуков, 2-5-8 символов\n' +
    'и 3-6-9 точек – кости каждой из трех мастей должны\n' +
    'принадлежать разным последовательностям, но не обязательно в\n' +
    'таком же порядке (может совмещаться с «Полностью закрытая»\n' +
    'при выигрыше со стены)',
  [EFan.KNITTED_STRAIGHT]:
    'Особый ряд, составленный не из обычных чоу, а из трех\n' +
    'различных последовательностей, например: 1-4-7 точек, 2-5-8\n' +
    'символов и 3-6-9 бамбуков, но не обязательно в таком же\n' +
    'порядке',
  [EFan.UPPER_FOUR]: 'Рука, составленная из нумерованных костей от 6 до 9',
  [EFan.LOWER_FOUR]: 'Рука, составленная из нумерованных костей от 1 до 4',
  [EFan.BIG_THREE_WINDS]: 'Рука, включающая три панга (или конга) ветров',

  // 8 points
  [EFan.MIXED_STRAIGHT]: 'Ряд (т.е. кости от 1 до 9) составленный из чоу всех трех мастей',
  [EFan.REVERSIBLE_TILES]:
    'Рука, полностью собранная из вертикально симметричных\n' +
    'костей, т.е. когда изображения на костях выглядят одинаково,\n' +
    'если их перевернуть на 180 градусов. Это кости: 1, 2, 3, 4, 5, 8 и 9\n' +
    'точек, 2, 4, 5, 6, 8 и 9 бамбуков и Белый дракон',
  [EFan.MIXED_TRIPLE_CHOW]: 'Три чоу одинаковой номерной последовательности, по одному в каждой масти',
  [EFan.MIXED_SHIFTED_PUNGS]:
    'Три панга (или конга), по одному в каждой масти, каждый следующий смещен на один номер вверх от предыдущего',
  [EFan.CHICKEN_HAND]: 'Рука, которая должна была бы стоить 0 очков (исключая очки за цветы)',
  [EFan.LAST_TILE_DRAW]:
    'Выигрыш (составление маджонга) взятием самой последней кости в стене (не совмещается с «Выигрыш со стены»)',
  [EFan.LAST_TILE_CLAIM]: 'Выигрыш (составление маджонга) взятием снесенной кости, которая является последней в игре',
  [EFan.OUT_WITH_REPLACEMENT_TILE]:
    'Выигрыш (составление маджонга) взятием замещающей кости после составления конга (но не замещения цветка)',
  [EFan.ROBBING_THE_KONG]:
    'Выигрыш с помощью кости, которую кто-либо добавил к\n' +
    'открытому пангу, чтобы создать конг (не может быть совмещено\n' +
    'с очками за «Последняя кость»)',
  [EFan.TWO_CONCEALED_KONGS]: 'Рука, которая содержит два закрытых конга',

  // 6 points
  [EFan.ALL_PUNGS]: 'Рука, составленная из четырех пангов (или конгов) и одной пары',
  [EFan.HALF_FLUSH]: 'Рука, составленная из любой из трех мастей в комбинации с благородными костями',
  [EFan.MIXED_SHIFTED_CHOWS]:
    'Три чоу, по одной в каждой масти, каждое следующее смещено на один номер вверх от предыдущего',
  [EFan.ALL_TYPES]: 'Рука, составленная из всех типов костей (символов, бамбуков, точек, ветров и драконов)',
  [EFan.MELDED_HAND]:
    'Все комбинации в руке (чоу, панг, конг и пара) должны быть\n' +
    'созданы с помощью костей, снесенных другими игроками. Все\n' +
    'комбинации должны быть открытыми, а игрок должен выиграть\n' +
    'единственно возможной костью, снесенной другим игроком',
  [EFan.TWO_DRAGON_PUNGS]: 'Два панга (или конга) костей драконов',

  // 4 points
  [EFan.OUTSIDE_HAND]: 'Рука, которая содержит терминальные и благородные кости в каждой комбинации, включая пару',
  [EFan.FULLY_CONCEALED_HAND]:
    'Рука, которую игрок завершает без единого объявления, и выигрывает взятием кости со стены',
  [EFan.TWO_MELDED_KONGS]:
    'Рука, которая содержит два открытых конга. Один открытый конг и один закрытый конг дают 6 очков',
  [EFan.LAST_TILE]:
    'Выигрыш с помощью кости, которая является последней из\n' +
    'четырех в своем роде (это должно быть очевидно для всех\n' +
    'игроков, основываясь на снесенных и открытых костях)',

  // 2 points
  [EFan.DRAGON_PUNG]: 'Панг или конг из костей драконов',
  [EFan.PREVALENT_WIND]: 'Панг или конг из костей ветра, соответствующего текущему преимущественному ветру',
  [EFan.SEAT_WIND]:
    'Панг или конг из костей ветра, соответствующего месту игрока за\n' +
    'столом (разыгрывающий – Восток, и далее, против часовой\n' +
    'стрелки от разыгрывающего, места других игроков: Юг, Запад,\n' +
    'Север)',
  [EFan.CONCEALED_HAND]: 'Закрытая рука (нет ни одной открытой комбинации) при выигрыше с помощью снесенной кости',
  [EFan.ALL_CHOWS]: 'Рука, состоящая только из чоу, без благородных костей',
  [EFan.TILE_HOG]: 'Имеются все четыре одинаковые кости, не составленные в конг',
  [EFan.DOUBLE_PUNG]: 'Два панга (или конга) одного номера в разных мастях',
  [EFan.TWO_CONCEALED_PUNGS]: 'Два панга, собранных без объявления',
  [EFan.CONCEALED_KONG]: 'Конг, составленный из костей, взятых со стены, и объявленный как конг',
  [EFan.ALL_SIMPLES]: 'Рука, составленная без использования терминальных и благородных костей',

  // 1 point
  [EFan.PURE_DOUBLE_CHOW]: 'Два идентичных чоу в одной масти',
  [EFan.MIXED_DOUBLE_CHOW]: 'Два чоу из одинаковых номеров, но в разных мастях',
  [EFan.SHORT_STRAIGHT]:
    'Два чоу в одной масти, которые продолжают друг друга, создавая последовательный ряд из шести костей',
  [EFan.TWO_TERMINAL_CHOWS]: 'Чоу из костей 1-2-3 и 7-8-9 одной масти',
  [EFan.PUNG_OF_TERMINALS_OR_HONORS]: 'Панг или конг единиц, девяток или ветров (панг драконов дает 2 очка)',
  [EFan.MELDED_KONG]: 'Конг, созданный с помощью снесенной кости другого игрока, или созданный из открытого панга',
  [EFan.ONE_VOIDED_SUIT]:
    'Рука, в которой использованы только две из трех мастей (т.е. не содержит костей одной из трех мастей)',
  [EFan.NO_HONORS]: 'Рука, составленная полностью из номерных костей, без ветров и драконов',
  [EFan.EDGE_WAIT]:
    'Ожидание 3, чтобы составить чоу 1-2-3 или 7, чтобы составить\n' +
    'чоу 7-8-9. Не засчитывается, если ожидается более одной кости.\n' +
    'Не засчитывается, если совмещено с другим типом ожидания',
  [EFan.CLOSED_WAIT]:
    'Ожидание кости, чей номер находится «внутри» (в середине)\n' +
    'ожидаемого чоу. Не засчитывается, если ожидается более одной\n' +
    'кости. Не засчитывается, если совмещено с другим типом\n' +
    'ожидания',
  [EFan.SINGLE_WAIT]:
    'Ожидание кости для составления пары. Не засчитывается, если\n' +
    'ожидается более одной кости (например, имеется 1-2-3-4 и\n' +
    'ожидается 1 или 4)',
  [EFan.SELF_DRAWN]: 'Выигрыш (объявление маджонга) с помощью новой кости, взятой со стены',
  [EFan.FLOWER_TILES]:
    'Каждая кость, на которой изображено китайское слово «Весна»\n' +
    '(или «Лето», «Осень», «Зима», «Вишня», «Орхидея», «Бамбук»,\n' +
    '«Хризантема») принесет вам одно очко, если вы выиграете',
};

export const FAN_EXAMPLES: Record<EFan, TTile[][][]> = {
  // 88 points
  [EFan.BIG_FOUR_WINDS]: [parsePlayableTileSets('WeWeWe WsWsWs WwWwWw WnWnWn')],
  [EFan.BIG_THREE_DRAGONS]: [parsePlayableTileSets('DrDrDr DgDgDg DwDwDw')],
  [EFan.ALL_GREEN]: [
    parsePlayableTileSets('b2b3b4 b2b3b4 b2b3b4 b6b6b6 b8b8'),
    parsePlayableTileSets('b2b2 b3b3 b3b3 b4b4 b4b4 b6b6 DgDg'),
  ],
  [EFan.NINE_GATES]: [parsePlayableTileSets('d1d1d1d2d3d4d5d6d7d8d9d9d9')],
  [EFan.FOUR_KONGS]: [parsePlayableTileSets('b1b1b1b1 c6c6c6c6 d8d8d8d8 DgDgDgDg')],
  [EFan.SEVEN_SHIFTED_PAIRS]: [parsePlayableTileSets('c2c2 c3c3 c4c4 c5c5 c6c6 c7c7 c8c8')],
  [EFan.THIRTEEN_ORPHANS]: [parsePlayableTileSets('b1b9c1c9d1d9WeWsWwWnDrDgDwb1')],

  // 64 points
  [EFan.ALL_TERMINALS]: [parsePlayableTileSets('b1b1b1 b9b9b9b9 c1c1c1 d9d9d9 c9c9')],
  [EFan.LITTLE_FOUR_WINDS]: [parsePlayableTileSets('WeWeWe WwWwWw WnWnWn WsWs')],
  [EFan.LITTLE_THREE_DRAGONS]: [parsePlayableTileSets('DgDgDg DwDwDw DgDg')],
  [EFan.ALL_HONORS]: [parsePlayableTileSets('WeWeWe WwWwWw WnWnWn DrDrDr DwDw')],
  [EFan.FOUR_CONCEALED_PUNGS]: [],
  [EFan.PURE_TERMINAL_CHOWS]: [parsePlayableTileSets('b1b2b3 b1b2b3 b7b8b9 b7b8b9 b5b5')],

  // 48 points
  [EFan.QUADRUPLE_CHOW]: [parsePlayableTileSets('d2d3d4 d2d3d4 d2d3d4 d2d3d4')],
  [EFan.FOUR_PURE_SHIFTED_PUNGS]: [parsePlayableTileSets('c5c5c5 c6c6c6 c7c7c7 c8c8c8')],

  // 32 points
  [EFan.FOUR_PURE_SHIFTED_CHOWS]: [
    parsePlayableTileSets('c1c2c3 c2c3c4 c3c4c5 c4c5c6'),
    parsePlayableTileSets('b1b2b3 b3b4b5 b5b6b7 b7b8b9'),
  ],
  [EFan.THREE_KONGS]: [parsePlayableTileSets('b1b1b1b1 c6c6c6c6 d8d8d8d8')],
  [EFan.ALL_TERMINALS_AND_HONORS]: [parsePlayableTileSets('c1c1c1 d1d1d1 d9d9d9 WnWnWn DgDg')],

  // 24 points
  [EFan.SEVEN_PAIRS]: [parsePlayableTileSets('c1c1 b7b7 d8d8 d9d9 WwWw WwWw DwDw')],
  [EFan.GREATER_HONORS_AND_KNITTED_TILES]: [
    parsePlayableTileSets('d1d4d7b2b5b8c6WeWsWwWnDrDgDw'),
    parsePlayableTileSets('c1c4d2d5d8b3b9WeWsWwWnDrDgDw'),
  ],
  [EFan.ALL_EVEN_PUNGS]: [parsePlayableTileSets('b2b2b2 b8b8b8 c6c6c6 d4d4d4 d8d8')],
  [EFan.FULL_FLUSH]: [parsePlayableTileSets('b1b2b3 b3b4b5 b7b7b7 b8b8b8 b9b9')],
  [EFan.PURE_TRIPLE_CHOW]: [parsePlayableTileSets('c3c4c5 c3c4c5 c3c4c5')],
  [EFan.PURE_SHIFTED_PUNGS]: [parsePlayableTileSets('d3d3d3 d4d4d4 d5d5d5')],
  [EFan.UPPER_TILES]: [parsePlayableTileSets('b7b7b7 c7c7c7 d7d8d9 c7c8c9 b9b9')],
  [EFan.MIDDLE_TILES]: [parsePlayableTileSets('b4b4b4 b5b5b5 d6d6d6 d4d5d6 c6c6')],
  [EFan.LOWER_TILES]: [parsePlayableTileSets('c1c1c1 b2b2b2 d2d2d2 d1d1d1 c3c3')],

  // 16 points
  [EFan.PURE_STRAIGHT]: [parsePlayableTileSets('c1c2c3 c4c5c6 c7c8c9'), parsePlayableTileSets('d1d2d3 d4d5d6 d7d8d9')],
  [EFan.THREE_SUITED_TERMINAL_CHOWS]: [parsePlayableTileSets('b1b2b3 b7b8b9 c1c2c3 c7c8c9 d5d5')],
  [EFan.PURE_SHIFTED_CHOWS]: [
    parsePlayableTileSets('c1c2c3 c2c3c4 c3c4c5'),
    parsePlayableTileSets('b1b2b3 b3b4b5 b5b6b7'),
  ],
  [EFan.ALL_FIVES]: [parsePlayableTileSets('b4b5b6 b5b5b5 c5c6c7 d3d4d5 d5d5')],
  [EFan.TRIPLE_PUNG]: [parsePlayableTileSets('b5b5b5 c5c5c5 d5d5d5')],
  [EFan.THREE_CONCEALED_PUNGS]: [],

  // 12 points
  [EFan.LESSER_HONORS_AND_KNITTED_TILES]: [
    parsePlayableTileSets('b1b4b7c2c5c8d3d6WeWsWwDrDgDw'),
    parsePlayableTileSets('d1d4d7b2b5b8c3c6c9WsWwWnDgDw'),
  ],
  [EFan.KNITTED_STRAIGHT]: [
    parsePlayableTileSets('b1b4b7 d2d5d8 c3c6c9'),
    parsePlayableTileSets('c1c4c7 b2b5b8 d3d6d9'),
  ],
  [EFan.UPPER_FOUR]: [parsePlayableTileSets('b6b6b6 c6c7c8 d7d8d9 d9d9d9 c7c7')],
  [EFan.LOWER_FOUR]: [parsePlayableTileSets('d1d1d1 d1d2d3 c4c4c4 b4b4b4 b2b2')],
  [EFan.BIG_THREE_WINDS]: [parsePlayableTileSets('WeWeWe WwWwWw WnWnWn')],

  // 8 points
  [EFan.MIXED_STRAIGHT]: [parsePlayableTileSets('b1b2b3 c4c5c6 d7d8d9')],
  [EFan.REVERSIBLE_TILES]: [parsePlayableTileSets('d1d2d3 d8d8d8 b4b5b6 b9b9b9 DwDw')],
  [EFan.MIXED_TRIPLE_CHOW]: [parsePlayableTileSets('c2c3c4 b2b3b4 d2d3d4')],
  [EFan.MIXED_SHIFTED_PUNGS]: [parsePlayableTileSets('b7b7b7 c8c8c8 d9d9d9')],
  [EFan.CHICKEN_HAND]: [],
  [EFan.LAST_TILE_DRAW]: [],
  [EFan.LAST_TILE_CLAIM]: [],
  [EFan.OUT_WITH_REPLACEMENT_TILE]: [],
  [EFan.ROBBING_THE_KONG]: [],
  [EFan.TWO_CONCEALED_KONGS]: [],

  // 6 points
  [EFan.ALL_PUNGS]: [parsePlayableTileSets('c1c1c1 b6b6b6 b8b8b8 DrDrDr d8d8')],
  [EFan.HALF_FLUSH]: [parsePlayableTileSets('DgDgDg b2b3b4 b8b8b8 b7b8b9 b5b5')],
  [EFan.MIXED_SHIFTED_CHOWS]: [parsePlayableTileSets('c1c2c3 d2d3d4 b3b4b5')],
  [EFan.ALL_TYPES]: [parsePlayableTileSets('c1c2c3 b6b6b6 d8d8d8 DwDwDw WeWe')],
  [EFan.MELDED_HAND]: [],
  [EFan.TWO_DRAGON_PUNGS]: [parsePlayableTileSets('DrDrDr DgDgDg')],

  // 4 points
  [EFan.OUTSIDE_HAND]: [parsePlayableTileSets('c1c2c3 c1c1c1 b1b1b1 d7d8d9 d9d9')],
  [EFan.FULLY_CONCEALED_HAND]: [],
  [EFan.TWO_MELDED_KONGS]: [],
  [EFan.LAST_TILE]: [],

  // 2 points
  [EFan.DRAGON_PUNG]: [parsePlayableTileSets('DrDrDr')],
  [EFan.PREVALENT_WIND]: [],
  [EFan.SEAT_WIND]: [],
  [EFan.CONCEALED_HAND]: [],
  [EFan.ALL_CHOWS]: [parsePlayableTileSets('c2c3c4 d3d4d5 b4b5b6 b7b8b9 d7d7')],
  [EFan.TILE_HOG]: [parsePlayableTileSets('d7d7d7 d7d8d9'), parsePlayableTileSets('c7c7 c7c7')],
  [EFan.DOUBLE_PUNG]: [parsePlayableTileSets('b5b5b5 d5d5d5')],
  [EFan.TWO_CONCEALED_PUNGS]: [],
  [EFan.CONCEALED_KONG]: [],
  [EFan.ALL_SIMPLES]: [parsePlayableTileSets('c2c3c4 d3d4d5 b4b5b6 b6b6b6 b4b4')],

  // 1 point
  [EFan.PURE_DOUBLE_CHOW]: [parsePlayableTileSets('c1c2c3 c1c2c3')],
  [EFan.MIXED_DOUBLE_CHOW]: [parsePlayableTileSets('c1c2c3 d1d2d3')],
  [EFan.SHORT_STRAIGHT]: [parsePlayableTileSets('d3d4d5 d6d7d8')],
  [EFan.TWO_TERMINAL_CHOWS]: [parsePlayableTileSets('b1b2b3 b7b8b9')],
  [EFan.PUNG_OF_TERMINALS_OR_HONORS]: [parsePlayableTileSets('d1d1d1'), parsePlayableTileSets('WsWsWs')],
  [EFan.MELDED_KONG]: [],
  [EFan.ONE_VOIDED_SUIT]: [parsePlayableTileSets('b1b1b1 b7b7b7 b8b8b8 DgDgDg d6d6')],
  [EFan.NO_HONORS]: [parsePlayableTileSets('b2b2b2 b3b3b3 b4b4b4 d5d5d5 c9c9')],
  [EFan.EDGE_WAIT]: [parsePlayableTileSets('b1b2 b3')],
  [EFan.CLOSED_WAIT]: [parsePlayableTileSets('d4d6 d5')],
  [EFan.SINGLE_WAIT]: [],
  [EFan.SELF_DRAWN]: [],
  [EFan.FLOWER_TILES]: [],
};
