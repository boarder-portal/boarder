import sortBy from 'lodash/sortBy';

import { STANDARD_TILES } from '../../constants/games/mahjong';
import { FAN_SCORES, NO_SETS_FANS } from 'common/constants/games/mahjong/fans';

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
  const knownSets = [...concealedSets, ...meldedSets];

  if (knownSets.length * 3 + hand.length !== 13) {
    return null;
  }

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

  if (
    setsVariations.length === 0 &&
    NO_SETS_FANS.every((fanType) => wholeHandFans.every(({ fan }) => fan !== fanType))
  ) {
    return null;
  }

  console.log(setsVariations);

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

      const fansMahjong = getBestFansMahjong(fans);

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
  fans = sortBy(fans, ({ fan }) => -FAN_SCORES[fan]);

  let pickedFans = null as TFan[] | null;
  let maxScore = 0;

  const calculateBestMahjong = (fansLeft: TFan[], includedFans: TFan[]): void => {
    const firstFan = fansLeft.at(0);

    if (!firstFan) {
      const score = getFansScore(includedFans);

      if (score > maxScore || !pickedFans) {
        maxScore = score;
        pickedFans = includedFans;
      }

      return;
    }

    const restFans = fansLeft.slice(1);

    if (canAddFan(includedFans, firstFan)) {
      calculateBestMahjong(restFans, [...includedFans, firstFan]);
    }

    const maxPossibleScore = getFansScore([...includedFans, ...restFans]);

    if (maxPossibleScore > maxScore) {
      calculateBestMahjong(restFans, includedFans);
    }
  };

  calculateBestMahjong(fans, []);

  if (!pickedFans) {
    return null;
  }

  const pureFans = pickedFans.filter(({ fan }) => fan !== EFan.FLOWER_TILES);

  if (getFansScore(pureFans) < 8) {
    return null;
  }

  return { fans: pickedFans, score: getFansScore(pickedFans) };
}
