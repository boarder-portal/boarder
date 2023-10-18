import { SECOND } from 'common/constants/date';

import { BonusType, BuffCosts, BuffType, GameOptions, MapType } from 'common/types/games/bombers';

export { default as MAPS } from './maps';

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  minPlayersCount: 1,
  maxPlayersCount: 4,
  mapType: null,
  withAbilities: true,
};

export const TIME_TO_START = 3 * SECOND;

export const EXPLOSION_TICK_DURATION = SECOND;
export const EXPLOSION_TICKS_COUNT = 3;

export const BONUS_PROBABILITY = 0.9;

export const BONUSES_WEIGHTS: Record<BonusType, number> = {
  [BonusType.SPEED]: 10,
  [BonusType.BOMB_COUNT]: 10,
  [BonusType.BOMB_RANGE]: 10,
  [BonusType.HP]: 2,
};

export const MAX_SPEED = 10;
export const MAX_BOMB_COUNT = 10;
export const MAX_BOMB_RANGE = 10;
export const MAX_HP = 3;

export const SUPER_SPEED = 15;
export const SUPER_BOMB_DAMAGE = 2;
export const SUPER_BOMB_MAX_PIERCED_OBJECTS_COUNT = 1;
export const SUPER_RANGE = 15;

export const DEFAULT_BUFF_COSTS: BuffCosts = {
  [BuffType.SUPER_SPEED]: 5,
  [BuffType.SUPER_BOMB]: 5,
  [BuffType.SUPER_RANGE]: 5,
  [BuffType.INVINCIBILITY]: 2,
  [BuffType.BOMB_INVINCIBILITY]: 0,
};

export const START_SPAWN_WALLS_TIMEOUT = 5 * SECOND;
export const START_SPAWN_WALL_TIMEOUT = SECOND;
export const RESET_WALLS_TIMEOUT = 3 * SECOND;

export const BUFF_DURATIONS: Record<BuffType, number> = {
  [BuffType.SUPER_SPEED]: 5 * SECOND,
  [BuffType.SUPER_BOMB]: 5 * SECOND,
  [BuffType.SUPER_RANGE]: 5 * SECOND,
  [BuffType.INVINCIBILITY]: 5 * SECOND,
  [BuffType.BOMB_INVINCIBILITY]: 1.2 * SECOND,
};

export const BOMBER_CELL_SIZE = 0.7;
export const BOMBER_CELL_MARGIN = (1 - BOMBER_CELL_SIZE) / 2;
export const CELLS_PER_SECOND = 1.5;
export const SPEED_INCREMENT = 0.3;

export const MAP_NAMES: Record<MapType, string> = {
  [MapType.CHESS]: 'Шахматы',
  [MapType.HALL]: 'Комната',
  [MapType.BUG]: 'Жук',
  [MapType.BUNKER]: 'Бункер',
  [MapType.TURTLE]: 'Черепаха',
  [MapType.CABINET]: 'Шкаф',
  [MapType.RACE]: 'Гонка',
  [MapType.WAVE]: 'Волна',
  [MapType.SIGHT]: 'Прицел',
  [MapType.FIELD]: 'Поле',
  [MapType.SUNFLOWER]: 'Подсолнух',
  [MapType.MEMBRANE]: 'Мембрана',
  [MapType.BUTTERFLY]: 'Бабочка',
  [MapType.SIEGE]: 'Осада',
  [MapType.CRAB]: 'Краб',
};
