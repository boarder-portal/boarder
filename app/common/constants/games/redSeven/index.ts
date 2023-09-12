import { CardColor, GameOptions } from 'common/types/games/redSeven';

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  minPlayersCount: 2,
  maxPlayersCount: 4,
  advancedRules: true,
  withActionRule: true,
  v1p2Rules: false,
};

export const COLOR_VALUES: Record<CardColor, number> = {
  [CardColor.RED]: 7,
  [CardColor.ORANGE]: 6,
  [CardColor.YELLOW]: 5,
  [CardColor.GREEN]: 4,
  [CardColor.BLUE]: 3,
  [CardColor.INDIGO]: 2,
  [CardColor.VIOLET]: 1,
};

export const WIN_SCORE_BY_PLAYER_COUNT: Partial<Record<number, number>> = {
  2: 40,
  3: 35,
  4: 30,
};
