import sortBy from 'lodash/sortBy';

import { KNITTED_SEQUENCES, STANDARD_TILES } from '../../../constants/games/mahjong/tiles';
import { MIN_SCORE } from 'common/constants/games/mahjong';
import { ALL_FANS, NO_SETS_FANS } from 'common/constants/games/mahjong/fans';

import {
  DeclaredSet,
  Fan,
  FanKind,
  FanType,
  FlowerTile,
  HandMahjong,
  PlayableTile,
  Set,
  SetConcealedType,
  SetType,
  Tile,
  WindSide,
} from 'common/types/games/mahjong';

import {
  canAddFan,
  getFansScore,
  getSetsFans,
  getSpecialFans,
  getSpecialSetsFans,
  getWholeHandFans,
  getWholeHandSetsFans,
} from 'common/utilities/games/mahjong/fans';
import { getAllSetsCombinations, getSetsVariations } from 'common/utilities/games/mahjong/sets';
import {
  getSupposedHandTileCount,
  getTileCount,
  isHonor,
  isPlayable,
  isTileSubset,
} from 'common/utilities/games/mahjong/tiles';

export interface HandScoreOptions {
  hand: Tile[];
  declaredSets: DeclaredSet[];
  flowers: FlowerTile[];
  seatWind: WindSide | null;
  roundWind: WindSide | null;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
  isLastWallTile: boolean;
  lastTileCandidates: Tile[];
  minScore?: number;
}

export interface HandScoreFullOptions extends HandScoreOptions {
  winningTile?: Tile;
  waits?: PlayableTile[];
}

export function getAllWaits(options: HandScoreOptions): PlayableTile[] {
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

export function getHandMahjong(options: HandScoreFullOptions): HandMahjong | null {
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

  let bestFans: Fan[] = [];
  let chosenSets: Set[] | null = null;
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
      const setsFans: Fan[] = [];

      getAllSetsCombinations(sets).forEach((sets) => {
        setsFans.push(...getSetsFans(sets, seatWind, roundWind));
      });

      const fans = [...wholeHandFans, ...wholeHandSetsFans, ...setsFans, ...specialFans, ...specialSetsFans];

      if (fans.every((fan) => fan.fan === FanKind.FLOWER_TILES)) {
        fans.push({
          type: FanType.HAND,
          fan: FanKind.CHICKEN_HAND,
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

    if (wholeHandFans.some(({ fan }) => fan === FanKind.LESSER_HONORS_AND_KNITTED_TILES)) {
      const simples = wholeHand.filter((tile) => !isHonor(tile));

      if (simples.length === 9) {
        const knittedSequence = KNITTED_SEQUENCES.find((knittedChows) =>
          knittedChows.every((knittedChow) => isTileSubset(knittedChow, simples)),
        );

        if (knittedSequence) {
          fans.push({
            type: FanType.SETS,
            fan: FanKind.KNITTED_STRAIGHT,
            sets: knittedSequence.map((tiles) => ({
              type: SetType.KNITTED_CHOW,
              tiles,
              concealedType: SetConcealedType.CONCEALED,
            })),
          });
        }
      }
    }

    if (isSelfDraw) {
      fans.push({
        type: FanType.HAND,
        fan: FanKind.FULLY_CONCEALED_HAND,
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

export function getPureFansScore(fans: Fan[]): number {
  return getFansScore(fans.filter(({ fan }) => fan !== FanKind.FLOWER_TILES));
}

function getBestFans(fans: Fan[], minScore: number): { fans: Fan[]; score: number } | null {
  fans = sortBy(fans, ({ fan }) => ALL_FANS.indexOf(fan));

  let pickedFans = null as Fan[] | null;
  let maxScore = 0;

  const calculateBestMahjong = (fansLeft: Fan[], includedFans: Fan[]): void => {
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

  return {
    fans: pickedFans,
    score: getFansScore(pickedFans),
  };
}
