import { EOnitamaCardType, IOnitamaGameOptions } from 'common/types/onitama';

export const DEFAULT_GAME_OPTIONS: IOnitamaGameOptions = {
  playersCount: 2,
};

export const ALL_CARDS: Record<EOnitamaCardType, number[][]> = {
  [EOnitamaCardType.TIGER]: [
    [+2, 0],
    [-1, 0],
  ],
  [EOnitamaCardType.DRAGON]: [
    [+1, -2],
    [+1, +2],
    [-1, -1],
    [-1, +1],
  ],
  [EOnitamaCardType.FROG]: [
    [0, -2],
    [+1, -1],
    [-1, +1],
  ],
  [EOnitamaCardType.RABBIT]: [
    [0, +2],
    [+1, +1],
    [-1, -1],
  ],
  [EOnitamaCardType.CRAB]: [
    [0, -2],
    [+1, 0],
    [0, +2],
  ],
  [EOnitamaCardType.ELEPHANT]: [
    [+1, -1],
    [+1, +1],
    [0, -1],
    [0, +1],
  ],
  [EOnitamaCardType.GOOSE]: [
    [+1, -1],
    [0, -1],
    [0, +1],
    [-1, +1],
  ],
  [EOnitamaCardType.ROOSTER]: [
    [+1, +1],
    [0, +1],
    [0, -1],
    [-1, -1],
  ],
  [EOnitamaCardType.MONKEY]: [
    [+1, -1],
    [+1, +1],
    [-1, +1],
    [-1, -1],
  ],
  [EOnitamaCardType.MANTIS]: [
    [+1, -1],
    [+1, +1],
    [-1, 0],
  ],
  [EOnitamaCardType.HORSE]: [
    [+1, 0],
    [0, -1],
    [-1, 0],
  ],
  [EOnitamaCardType.OX]: [
    [+1, 0],
    [0, +1],
    [-1, 0],
  ],
  [EOnitamaCardType.CRANE]: [
    [-1, -1],
    [-1, +1],
    [+1, 0],
  ],
  [EOnitamaCardType.BOAR]: [
    [+1, 0],
    [0, -1],
    [0, +1],
  ],
  [EOnitamaCardType.EEL]: [
    [+1, -1],
    [0, +1],
    [-1, -1],
  ],
  [EOnitamaCardType.COBRA]: [
    [+1, +1],
    [0, -1],
    [-1, +1],
  ],
};
