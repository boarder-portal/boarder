import sortBy from 'lodash/sortBy';

import { KNITTED_SEQUENCES, STANDARD_TILES } from '../../constants/games/mahjong/tiles';
import { ALL_FANS, NO_SETS_FANS } from 'common/constants/games/mahjong/fans';
import { MIN_SCORE } from 'common/constants/games/mahjong';

import {
  EFan,
  EFanType,
  ESet,
  ESetConcealedType,
  EWind,
  IFlowerTile,
  IHandMahjong,
  TDeclaredSet,
  TFan,
  TPlayableTile,
  TSet,
  TTile,
} from 'common/types/mahjong';

import { getAllSetsCombinations, getSetsVariations } from 'common/utilities/mahjong/sets';
import {
  canAddFan,
  getFansScore,
  getSetsFans,
  getSpecialFans,
  getSpecialSetsFans,
  getWholeHandFans,
  getWholeHandSetsFans,
} from 'common/utilities/mahjong/fans';
import {
  getSupposedHandTileCount,
  getTileCount,
  isHonor,
  isPlayable,
  isTileSubset,
} from 'common/utilities/mahjong/tiles';

export interface IHandScoreOptions {
  hand: TTile[];
  declaredSets: TDeclaredSet[];
  flowers: IFlowerTile[];
  seatWind: EWind | null;
  roundWind: EWind | null;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
  isLastWallTile: boolean;
  lastTileCandidates: TTile[];
  minScore?: number;
}

export interface IHandScoreFullOptions extends IHandScoreOptions {
  winningTile?: TTile;
  waits?: TPlayableTile[];
}

export function getAllWaits(options: IHandScoreOptions): TPlayableTile[] {
  const { hand, declaredSets } = options;
  const wholeHand = [...hand, ...declaredSets.flatMap(({ tiles }) => tiles)];
  const possibleTiles = STANDARD_TILES.filter((tile) => {
    return getTileCount(wholeHand, tile) < 4;
  });

  const waitsWithSingleWait = possibleTiles.filter((tile) =>
    getHandMahjong({
      ...options,
      winningTile: tile,
      waits: [tile],
    }),
  );
  const waitsWithoutSingleWait = possibleTiles.filter((tile) =>
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
  const { hand, declaredSets, seatWind, roundWind, isSelfDraw, minScore = MIN_SCORE } = options;
  const waits = options.waits ?? getAllWaits(options);
  const winningTile = options.winningTile ?? waits.at(0);

  if (!winningTile || !isPlayable(winningTile)) {
    return null;
  }

  if (hand.length !== getSupposedHandTileCount(declaredSets.length) || !hand.every(isPlayable)) {
    return null;
  }

  const wholeHand = [...hand, ...declaredSets.flatMap(({ tiles }) => tiles), winningTile];
  const wholeHandFans = getWholeHandFans(wholeHand);
  const specialFans = getSpecialFans(options, winningTile, wholeHand);

  const setsVariations = getSetsVariations({
    hand: [...hand, winningTile],
    declaredSets,
    isSelfDraw,
  });

  let bestFans: TFan[] = [];
  let chosenSets: TSet[] | null = null;
  let maxScore = 0;

  if (
    setsVariations.length === 0 &&
    NO_SETS_FANS.every((fanType) => wholeHandFans.every(({ fan }) => fan !== fanType))
  ) {
    return null;
  }

  if (setsVariations.length > 0) {
    setsVariations.forEach((sets) => {
      const wholeHandSetsFans = getWholeHandSetsFans(sets, isSelfDraw);
      const specialSetsFans = getSpecialSetsFans(sets, winningTile, waits);
      const setsFans: TFan[] = [];

      getAllSetsCombinations(sets).forEach((sets) => {
        setsFans.push(...getSetsFans(sets, seatWind, roundWind));
      });

      const fans = [...wholeHandFans, ...wholeHandSetsFans, ...setsFans, ...specialFans, ...specialSetsFans];

      if (fans.every((fan) => fan.fan === EFan.FLOWER_TILES)) {
        fans.push({
          type: EFanType.HAND,
          fan: EFan.CHICKEN_HAND,
        });
      }

      const bestFansInfo = getBestFans(fans, minScore);

      if (bestFansInfo && bestFansInfo.score > maxScore) {
        bestFans = bestFansInfo.fans;
        chosenSets = sets;
        maxScore = bestFansInfo.score;
      }
    });
  } else {
    const fans = [...wholeHandFans, ...specialFans];

    if (wholeHandFans.some(({ fan }) => fan === EFan.LESSER_HONORS_AND_KNITTED_TILES)) {
      const simples = wholeHand.filter((tile) => !isHonor(tile));

      if (simples.length === 9) {
        const knittedSequence = KNITTED_SEQUENCES.find((knittedChows) =>
          knittedChows.every((knittedChow) => isTileSubset(knittedChow, simples)),
        );

        if (knittedSequence) {
          fans.push({
            type: EFanType.SETS,
            fan: EFan.KNITTED_STRAIGHT,
            sets: knittedSequence.map((tiles) => ({
              type: ESet.KNITTED_CHOW,
              tiles,
              concealedType: ESetConcealedType.CONCEALED,
            })),
          });
        }
      }
    }

    if (isSelfDraw) {
      fans.push({
        type: EFanType.HAND,
        fan: EFan.FULLY_CONCEALED_HAND,
      });
    }

    const bestFansInfo = getBestFans(fans, minScore);

    if (bestFansInfo) {
      bestFans = bestFansInfo.fans;
      maxScore = bestFansInfo.score;
    }
  }

  if (!bestFans.length) {
    return null;
  }

  return {
    hand,
    declaredSets,
    winningTile,
    fans: bestFans,
    score: maxScore,
    sets: chosenSets,
    waits,
  };
}

export function getPureFansScore(fans: TFan[]): number {
  return getFansScore(fans.filter(({ fan }) => fan !== EFan.FLOWER_TILES));
}

function getBestFans(fans: TFan[], minScore: number): { fans: TFan[]; score: number } | null {
  fans = sortBy(fans, ({ fan }) => ALL_FANS.indexOf(fan));

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

  if (getPureFansScore(pickedFans) < minScore) {
    return null;
  }

  return { fans: pickedFans, score: getFansScore(pickedFans) };
}
