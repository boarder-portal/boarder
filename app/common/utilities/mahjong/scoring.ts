import { EFan, EWind, TTile } from 'common/types/mahjong';

export interface IHandScoreOptions {
  hand: TTile[];
  concealedSets: TTile[][];
  meldedSets: TTile[][];
  flowers: TTile[];
  winningTile: TTile;
  seatWind: EWind;
  roundWind: EWind;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
  isLastTile: boolean;
  isLastWallTile: boolean;
}

export interface ITilesFan {
  fan: EFan;
  tiles: TTile[];
}

export interface IHandMahjong {
  fans: ITilesFan[];
  score: number;
}

export function getHandMahjong(options: IHandScoreOptions): IHandMahjong | null {
  const {
    hand,
    concealedSets,
    meldedSets,
    flowers,
    winningTile,
    seatWind,
    roundWind,
    isSelfDraw,
    isReplacementTile,
    isRobbingKong,
    isLastTile,
    isLastWallTile,
  } = options;

  // TODO: 6 points for concealed kong + melded kong

  return null;
}
