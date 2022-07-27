import sortBy from 'lodash/sortBy';

import { KNITTED_SEQUENCES, STANDARD_TILES } from '../../constants/games/mahjong';
import { FANS, NO_SETS_FANS } from 'common/constants/games/mahjong/fans';

import {
  EFan,
  EFanType,
  ESet,
  ESetConcealedType,
  EWind,
  IFlowerTile,
  IHandMahjong,
  IKongSet,
  TConcealedSet,
  TFan,
  TMeldedSet,
  TSet,
  TTile,
} from 'common/types/mahjong';

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
import { isEqualTilesCallback, isHonor, isTileSubset } from 'common/utilities/mahjong/tiles';

export interface IHandScoreOptions {
  hand: TTile[];
  concealedSets: TConcealedSet<IKongSet>[];
  meldedSets: TMeldedSet[];
  flowers: IFlowerTile[];
  seatWind: EWind;
  roundWind: EWind;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
  isLastTile: boolean;
  isLastWallTile: boolean;
}

export interface IHandScoreFullOptions extends IHandScoreOptions {
  winningTile?: TTile;
  waits?: TTile[];
}

export function getAllWaits(options: IHandScoreOptions): TTile[] {
  const { hand, concealedSets, meldedSets } = options;
  const wholeHand = [
    ...hand,
    ...concealedSets.flatMap(({ tiles }) => tiles),
    ...meldedSets.flatMap(({ tiles }) => tiles),
  ];
  const possibleTiles = STANDARD_TILES.filter((tile) => {
    return wholeHand.filter(isEqualTilesCallback(tile)).length < 4;
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
  const { hand, concealedSets, meldedSets, seatWind, roundWind, isSelfDraw } = options;
  const waits = options.waits ?? getAllWaits(options);
  const winningTile = options.winningTile ?? waits.at(0);

  if (!winningTile) {
    return null;
  }

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
    isSelfDraw,
  });

  let mahjong: IHandMahjong | null = null;

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

      const fansMahjong = getBestFansMahjong(fans, sets, waits);

      if (!mahjong || (fansMahjong && fansMahjong.score > mahjong.score)) {
        mahjong = fansMahjong;
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

    mahjong = getBestFansMahjong(fans, null, waits);
  }

  if (!mahjong) {
    return null;
  }

  return mahjong;
}

function getBestFansMahjong(fans: TFan[], sets: TSet[] | null, waits: TTile[]): IHandMahjong | null {
  fans = sortBy(fans, ({ fan }) => FANS.indexOf(fan));

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

  return { fans: pickedFans, sets, waits, score: getFansScore(pickedFans) };
}
