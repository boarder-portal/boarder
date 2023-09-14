import { SECOND } from 'common/constants/date';

import { GameOptions } from 'common/types/games/carcassonne';

export { default as ALL_CARDS } from 'common/constants/games/carcassonne/cards';

export const DEFAULT_WITH_TIMER = false;
export const DEFAULT_GAME_OPTIONS: GameOptions = {
  minPlayersCount: 1,
  maxPlayersCount: 5,
};

export const ALL_SIDE_PARTS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const CARDS_IN_HAND = 3;

export const BASE_TIME = 45 * SECOND;
export const TURN_INCREMENT = 700;
