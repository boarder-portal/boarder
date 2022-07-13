import { GREEN_TILES, ORPHANS, REVERSIBLE_TILES } from '../../constants/games/mahjong';

import { EFan, EFanType, ESuit, EWind, ISet, TTile } from 'common/types/mahjong';

import { getSetsVariations } from 'common/utilities/mahjong/sets';

import { isHonor, isSuited, isTerminal, isTileSubset } from './tiles';

export interface IHandScoreOptions {
  hand: TTile[];
  concealedSets: ISet[];
  meldedSets: ISet[];
  flowers: TTile[];
  winningTile: TTile;
  waits: TTile[];
  seatWind: EWind;
  roundWind: EWind;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
  isLastTile: boolean;
  isLastWallTile: boolean;
}

export interface IHandFan {
  type: EFanType.HAND;
  fan: EFan;
}

export interface ISetsFan {
  type: EFanType.SETS;
  fan: EFan;
  sets: ISet[];
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

export function getHandMahjong(options: IHandScoreOptions): IHandMahjong | null {
  const { hand, concealedSets, meldedSets, winningTile, seatWind, roundWind } = options;
  const isConcealed = meldedSets.length === 0;
  const declaredAnySets = !isConcealed || concealedSets.length !== 0;
  const wholeHand = [
    ...hand,
    ...concealedSets.flatMap(({ tiles }) => tiles),
    ...meldedSets.flatMap(({ tiles }) => tiles),
    winningTile,
  ];
  const wholeHandFans = getWholeHandFans(wholeHand, declaredAnySets);
  const specialFans = getSpecialFans({
    ...options,
    isConcealed,
  });

  const setsVariations = getSetsVariations({
    hand: [...hand, winningTile],
    knownSets: [...concealedSets, ...meldedSets],
    isSelfDraw: options.isSelfDraw,
  });

  return null;
}

function getSetsFans(sets: ISet[]): TFan[] {
  return [];
}

function getWholeHandFans(hand: TTile[], declaredAnySets: boolean): TFan[] {
  const handWithoutWinningTile = hand.slice(0, -1);
  const winningTile = hand.at(-1);
  const suits = hand.reduce((suits, tile) => {
    if (isSuited(tile)) {
      suits.add(tile.suit);
    }

    return suits;
  }, new Set<ESuit>());

  if (!winningTile) {
    return [];
  }

  const fans: EFan[] = [];

  if (isTileSubset(ORPHANS, hand) && isTileSubset(hand, ORPHANS)) {
    fans.push(EFan.THIRTEEN_ORPHANS);
  }

  // TODO: knitted tiles

  if (isTileSubset(hand, GREEN_TILES)) {
    fans.push(EFan.ALL_GREEN);
  }

  if (
    !declaredAnySets &&
    isSuited(winningTile) &&
    handWithoutWinningTile.every(isSuited) &&
    handWithoutWinningTile.every(({ suit }) => suit === winningTile.suit) &&
    handWithoutWinningTile
      .map(({ value }) => value)
      .sort()
      .join('') === '1112345678999'
  ) {
    fans.push(EFan.NINE_GATES);
  }

  if (hand.every(isTerminal)) {
    fans.push(EFan.ALL_TERMINALS);
  } else if (hand.every(isHonor)) {
    fans.push(EFan.ALL_HONORS);
  } else if (hand.every((tile) => isTerminal(tile) || isHonor(tile))) {
    fans.push(EFan.ALL_TERMINALS_AND_HONORS);
  }

  if (suits.size === 1) {
    fans.push(hand.every(isSuited) ? EFan.FULL_FLUSH : EFan.HALF_FLUSH);
  }

  if (hand.every((tile) => isSuited(tile) && tile.value >= 7)) {
    fans.push(EFan.UPPER_TILES);
  } else if (hand.every((tile) => isSuited(tile) && tile.value >= 4 && tile.value <= 6)) {
    fans.push(EFan.MIDDLE_TILES);
  } else if (hand.every((tile) => isSuited(tile) && tile.value <= 3)) {
    fans.push(EFan.LOWER_TILES);
  } else if (hand.every((tile) => isSuited(tile) && tile.value >= 6)) {
    fans.push(EFan.UPPER_FOUR);
  } else if (hand.every((tile) => isSuited(tile) && tile.value <= 4)) {
    fans.push(EFan.LOWER_FOUR);
  }

  if (isTileSubset(hand, REVERSIBLE_TILES)) {
    fans.push(EFan.REVERSIBLE_TILES);
  }

  if (hand.every((tile) => !isHonor(tile) && !isTerminal(tile))) {
    fans.push(EFan.ALL_SIMPLES);
  }

  if (suits.size === 2) {
    fans.push(EFan.ONE_VOIDED_SUIT);
  }

  if (hand.every((tile) => !isHonor(tile))) {
    fans.push(EFan.NO_HONORS);
  }

  return fans.map((fan) => ({
    type: EFanType.HAND,
    fan,
  }));
}

function getSpecialFans(options: IHandScoreOptions & { isConcealed: boolean }): TFan[] {
  const fans: TFan[] = [];

  if (options.isLastWallTile) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: options.isSelfDraw ? EFan.LAST_TILE_DRAW : EFan.LAST_TILE_CLAIM,
      tiles: [],
    });
  }

  if (options.isReplacementTile) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.OUT_WITH_REPLACEMENT_TILE,
      tiles: [],
    });
  }

  if (options.isRobbingKong) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.ROBBING_THE_KONG,
      tiles: [],
    });
  }

  if (options.isConcealed) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: options.isSelfDraw ? EFan.FULLY_CONCEALED_HAND : EFan.CONCEALED_HAND,
      tiles: [],
    });
  }

  if (options.isLastTile) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.LAST_TILE,
      tiles: [],
    });
  }

  if (options.isSelfDraw) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.SELF_DRAWN,
      tiles: [],
    });
  }

  if (options.waits.length === 1) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.SINGLE_WAIT,
      tiles: [],
    });
  }

  const flowerFans: TFan[] = options.flowers.map((flower) => ({
    type: EFanType.SPECIAL,
    fan: EFan.FLOWER_TILES,
    tiles: [flower],
  }));

  fans.push(...flowerFans);

  return fans;
}
