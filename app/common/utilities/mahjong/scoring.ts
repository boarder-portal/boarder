import { STANDARD_TILES } from '../../constants/games/mahjong';

import { EFan, EFanType, EWind, TSet, TTile } from 'common/types/mahjong';

import { getSetsCombinations, getSetsVariations } from 'common/utilities/mahjong/sets';
import {
  canAddFan,
  getFansScore,
  getSetsFans,
  getSpecialFans,
  getSpecialSetsFans,
  getWholeHandFans,
  getWholeHandSetsFans,
} from 'common/utilities/mahjong/fans';

export interface IHandScoreOptions {
  hand: TTile[];
  concealedSets: TSet[];
  meldedSets: TSet[];
  flowers: TTile[];
  seatWind: EWind;
  roundWind: EWind;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
  isLastTile: boolean;
  isLastWallTile: boolean;
}

export interface IHandScoreFullOptions extends IHandScoreOptions {
  winningTile: TTile;
  waits: TTile[];
}

export interface IHandFan {
  type: EFanType.HAND;
  fan: EFan;
}

export interface ISetsFan {
  type: EFanType.SETS;
  fan: EFan;
  sets: TSet[];
}

export interface ISpecialFan {
  type: EFanType.SPECIAL;
  fan: EFan;
  tiles: TTile[];
}

export type TFan = IHandFan | ISetsFan | ISpecialFan;

export interface IHandMahjong {
  fans: TFan[];
  score: number;
}

export function getAllWaits(options: IHandScoreOptions): TTile[] {
  const waitsWithSingleWait = STANDARD_TILES.filter((tile) =>
    getHandMahjong({
      ...options,
      winningTile: tile,
      waits: [tile],
    }),
  );
  const waitsWithoutSingleWait = STANDARD_TILES.filter((tile) =>
    getHandMahjong({
      ...options,
      winningTile: tile,
      waits: STANDARD_TILES,
    }),
  );

  if (!waitsWithoutSingleWait.length) {
    return waitsWithSingleWait.length === 1 ? waitsWithSingleWait : [];
  }

  return waitsWithoutSingleWait;
}

export function getHandMahjong(options: IHandScoreFullOptions): IHandMahjong | null {
  const { hand, concealedSets, meldedSets, winningTile, seatWind, roundWind } = options;
  const wholeHand = [
    ...hand,
    ...concealedSets.flatMap(({ tiles }) => tiles),
    ...meldedSets.flatMap(({ tiles }) => tiles),
    winningTile,
  ];
  const wholeHandFans = getWholeHandFans(wholeHand);
  const specialFans = getSpecialFans(options);

  const setsVariations = getSetsVariations({
    hand: [...hand, winningTile],
    knownSets: [...concealedSets, ...meldedSets],
    isSelfDraw: options.isSelfDraw,
  });

  let mahjong: IHandMahjong | null = null;

  if (setsVariations.length > 0) {
    setsVariations.forEach((sets) => {
      const wholeHandSetsFans = getWholeHandSetsFans(sets, options.isSelfDraw);
      const specialSetsFans = getSpecialSetsFans(sets, winningTile, options.waits);
      const setsFans: TFan[] = [];

      getSetsCombinations(sets).forEach((sets) => {
        setsFans.push(...getSetsFans(sets, seatWind, roundWind));
      });

      const fans = [...wholeHandFans, ...wholeHandSetsFans, ...setsFans, ...specialFans, ...specialSetsFans];

      if (fans.every((fan) => fan.fan === EFan.FLOWER_TILES)) {
        fans.push({
          type: EFanType.HAND,
          fan: EFan.CHICKEN_HAND,
        });
      }

      const fansMahjong = getBestFansMahjong([...wholeHandFans, ...wholeHandSetsFans, ...setsFans, ...specialFans]);

      if (!mahjong || (fansMahjong && fansMahjong.score > mahjong.score)) {
        mahjong = fansMahjong;
      }
    });
  } else {
    mahjong = getBestFansMahjong([...wholeHandFans, ...specialFans]);
  }

  if (!mahjong) {
    return null;
  }

  return mahjong;
}

function getBestFansMahjong(fans: TFan[]): IHandMahjong | null {
  const fansCombinations: TFan[][] = [];

  const buildFansCombinations = (fansLeft: TFan[], includedFans: TFan[]): void => {
    const firstFan = fansLeft.at(0);

    if (!firstFan) {
      if (includedFans) {
        fansCombinations.push(includedFans);
      }

      return;
    }

    buildFansCombinations(fansLeft.slice(1), includedFans);

    if (canAddFan(includedFans, firstFan)) {
      buildFansCombinations(fansLeft.slice(1), [...includedFans, firstFan]);
    }
  };

  buildFansCombinations(fans, []);

  const maxScore = Math.max(...fansCombinations.map(getFansScore));

  if (maxScore === -Infinity) {
    return null;
  }

  const pickedFans = fansCombinations.find((fans) => getFansScore(fans) === maxScore);

  if (!pickedFans) {
    return null;
  }

  const pureFans = pickedFans.filter(({ fan }) => fan !== EFan.FLOWER_TILES);

  if (getFansScore(pureFans) < 8) {
    return null;
  }

  return { fans: pickedFans, score: getFansScore(pickedFans) };
}
