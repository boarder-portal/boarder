import { EBonus, EMap, IGameOptions } from 'common/types/bombers';

export { default as MAPS } from './maps';

export const DEFAULT_GAME_OPTIONS: IGameOptions = {
  minPlayersCount: 1,
  maxPlayersCount: 4,
  mapType: EMap.DEFAULT,
};

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

export const BOMBER_CELL_SIZE = 0.8;
export const CELLS_PER_SECOND = 1.5;
