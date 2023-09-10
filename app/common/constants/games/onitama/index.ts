import { CardType, GameOptions } from 'common/types/games/onitama';

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  minPlayersCount: 2,
  maxPlayersCount: 2,
};

export const ALL_CARDS: Record<CardType, number[][]> = {
  [CardType.TIGER]: [
    [+2, 0],
    [-1, 0],
  ],
  [CardType.DRAGON]: [
    [+1, -2],
    [+1, +2],
    [-1, -1],
    [-1, +1],
  ],
  [CardType.FROG]: [
    [0, -2],
    [+1, -1],
    [-1, +1],
  ],
  [CardType.RABBIT]: [
    [0, +2],
    [+1, +1],
    [-1, -1],
  ],
  [CardType.CRAB]: [
    [0, -2],
    [+1, 0],
    [0, +2],
  ],
  [CardType.ELEPHANT]: [
    [+1, -1],
    [+1, +1],
    [0, -1],
    [0, +1],
  ],
  [CardType.GOOSE]: [
    [+1, -1],
    [0, -1],
    [0, +1],
    [-1, +1],
  ],
  [CardType.ROOSTER]: [
    [+1, +1],
    [0, +1],
    [0, -1],
    [-1, -1],
  ],
  [CardType.MONKEY]: [
    [+1, -1],
    [+1, +1],
    [-1, +1],
    [-1, -1],
  ],
  [CardType.MANTIS]: [
    [+1, -1],
    [+1, +1],
    [-1, 0],
  ],
  [CardType.HORSE]: [
    [+1, 0],
    [0, -1],
    [-1, 0],
  ],
  [CardType.OX]: [
    [+1, 0],
    [0, +1],
    [-1, 0],
  ],
  [CardType.CRANE]: [
    [-1, -1],
    [-1, +1],
    [+1, 0],
  ],
  [CardType.BOAR]: [
    [+1, 0],
    [0, -1],
    [0, +1],
  ],
  [CardType.EEL]: [
    [+1, -1],
    [0, +1],
    [-1, -1],
  ],
  [CardType.COBRA]: [
    [+1, +1],
    [0, -1],
    [-1, +1],
  ],
};
