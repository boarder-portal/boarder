import { EBonus, EBuff, EMap, IGameOptions } from 'common/types/bombers';

export { default as MAPS } from './maps';

export const DEFAULT_GAME_OPTIONS: IGameOptions = {
  minPlayersCount: 1,
  maxPlayersCount: 4,
  mapType: null,
  withAbilities: true,
};

export const TIME_TO_START = 3000;

export const EXPLOSION_TICK_DURATION = 1000;
export const EXPLOSION_TICKS_COUNT = 3;

export const BONUS_PROBABILITY = 0.9;

export const BONUSES_WEIGHTS: Record<EBonus, number> = {
  [EBonus.SPEED]: 10,
  [EBonus.BOMB_COUNT]: 10,
  [EBonus.BOMB_RANGE]: 10,
  [EBonus.HP]: 2,
};

export const MAX_SPEED = 10;
export const MAX_BOMB_COUNT = 10;
export const MAX_BOMB_RANGE = 10;
export const MAX_HP = 3;

export const SUPER_SPEED_COST = 5;
export const SUPER_SPEED = 15;
export const SUPER_BOMB_COST = 5;
export const SUPER_BOMB_DAMAGE = 2;
export const SUPER_BOMB_MAX_PIERCED_OBJECTS_COUNT = 1;
export const SUPER_RANGE_COST = 5;
export const SUPER_RANGE = 15;
export const INVINCIBILITY_COST = 2;

export const START_SPAWN_WALLS_TIMEOUT = 5 * 1000;
export const START_SPAWN_WALL_TIMEOUT = 1000;
export const RESET_WALLS_TIMEOUT = 3 * 1000;

export const BUFF_DURATIONS: Record<EBuff, number> = {
  [EBuff.SUPER_SPEED]: 5 * 1000,
  [EBuff.SUPER_BOMB]: 5 * 1000,
  [EBuff.SUPER_RANGE]: 5 * 1000,
  [EBuff.INVINCIBILITY]: 5 * 1000,
  [EBuff.BOMB_INVINCIBILITY]: 1.2 * 1000,
};

export const BOMBER_CELL_SIZE = 0.7;
export const BOMBER_CELL_MARGIN = (1 - BOMBER_CELL_SIZE) / 2;
export const CELLS_PER_SECOND = 1.5;
export const SPEED_INCREMENT = 0.3;

export const MAP_NAMES: Record<EMap, string> = {
  [EMap.CHESS]: 'Шахматы',
  [EMap.HALL]: 'Комната',
  [EMap.BUG]: 'Жук',
  [EMap.BUNKER]: 'Бункер',
  [EMap.TURTLE]: 'Черепаха',
  [EMap.CABINET]: 'Шкаф',
  [EMap.RACE]: 'Гонка',
  [EMap.WAVE]: 'Волна',
  [EMap.SIGHT]: 'Прицел',
  [EMap.FIELD]: 'Поле',
  [EMap.SUNFLOWER]: 'Подсолнух',
  [EMap.MEMBRANE]: 'Мембрана',
  [EMap.BUTTERFLY]: 'Бабочка',
  [EMap.SIEGE]: 'Осада',
  [EMap.CRAB]: 'Краб',
};
