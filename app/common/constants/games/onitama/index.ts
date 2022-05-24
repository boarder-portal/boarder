import { ECardType, IGameOptions } from 'common/types/onitama';

export const DEFAULT_GAME_OPTIONS: IGameOptions = {
  minPlayersCount: 2,
  maxPlayersCount: 2,
};

export const ALL_CARDS: Record<ECardType, number[][]> = {
  [ECardType.TIGER]: [
    [+2, 0],
    [-1, 0],
  ],
  [ECardType.DRAGON]: [
    [+1, -2],
    [+1, +2],
    [-1, -1],
    [-1, +1],
  ],
  [ECardType.FROG]: [
    [0, -2],
    [+1, -1],
    [-1, +1],
  ],
  [ECardType.RABBIT]: [
    [0, +2],
    [+1, +1],
    [-1, -1],
  ],
  [ECardType.CRAB]: [
    [0, -2],
    [+1, 0],
    [0, +2],
  ],
  [ECardType.ELEPHANT]: [
    [+1, -1],
    [+1, +1],
    [0, -1],
    [0, +1],
  ],
  [ECardType.GOOSE]: [
    [+1, -1],
    [0, -1],
    [0, +1],
    [-1, +1],
  ],
  [ECardType.ROOSTER]: [
    [+1, +1],
    [0, +1],
    [0, -1],
    [-1, -1],
  ],
  [ECardType.MONKEY]: [
    [+1, -1],
    [+1, +1],
    [-1, +1],
    [-1, -1],
  ],
  [ECardType.MANTIS]: [
    [+1, -1],
    [+1, +1],
    [-1, 0],
  ],
  [ECardType.HORSE]: [
    [+1, 0],
    [0, -1],
    [-1, 0],
  ],
  [ECardType.OX]: [
    [+1, 0],
    [0, +1],
    [-1, 0],
  ],
  [ECardType.CRANE]: [
    [-1, -1],
    [-1, +1],
    [+1, 0],
  ],
  [ECardType.BOAR]: [
    [+1, 0],
    [0, -1],
    [0, +1],
  ],
  [ECardType.EEL]: [
    [+1, -1],
    [0, +1],
    [-1, -1],
  ],
  [ECardType.COBRA]: [
    [+1, +1],
    [0, -1],
    [-1, +1],
  ],
};
