import {
  ALL_SUITS,
  GREEN_TILES,
  IMPLIED_FANS,
  KNITTED_SEQUENCES,
  ORPHANS,
  REVERSIBLE_TILES,
  TERMINAL_CHOWS_SETS,
} from 'common/constants/games/mahjong';
import { FAN_SCORES } from 'common/constants/games/mahjong/fans';

import {
  EFan,
  EFanType,
  ESetConcealedType,
  EWind,
  IHandFan,
  ISetsFan,
  ISpecialFan,
  TFan,
  TSet,
  TTile,
} from 'common/types/mahjong';

import {
  areSameValues,
  areSuited,
  getSortedValuesString,
  getSuitsCount,
  isDragon,
  isEqualTiles,
  isEqualTilesCallback,
  isFlush,
  isHonor,
  isStraight,
  isSuited,
  isTerminal,
  isTerminalOrHonor,
  isTileSubset,
  isWind,
  tilesContainTile,
  wind,
} from 'common/utilities/mahjong/tiles';
import { IHandScoreFullOptions } from 'common/utilities/mahjong/scoring';
import {
  areChows,
  areKongs,
  arePungs,
  getSetTile,
  getTileHogs,
  isChow,
  isConcealed,
  isEqualSetOfSets,
  isKnittedChow,
  isPair,
  isPung,
} from 'common/utilities/mahjong/sets';
import isDefined from 'common/utilities/isDefined';

export function isHandFan(fan: TFan): fan is IHandFan {
  return fan.type === EFanType.HAND;
}

export function isSetsFan(fan: TFan): fan is ISetsFan {
  return fan.type === EFanType.SETS;
}

export function isSpecialFan(fan: TFan): fan is ISpecialFan {
  return fan.type === EFanType.SPECIAL;
}

export function getFanScore(fan: TFan): number {
  return FAN_SCORES[fan.fan];
}

export function getFansScore(fans: TFan[]): number {
  return fans.reduce((score, fan) => score + getFanScore(fan), 0);
}

export function getSetsFans(sets: TSet[], seatWind: EWind, roundWind: EWind): TFan[] {
  const firstSet = sets.at(0);

  if (!firstSet) {
    return [];
  }

  const setsTiles = sets.map(getSetTile);
  const firstSetTile = getSetTile(firstSet);
  const suitsCount = getSuitsCount(setsTiles);
  const pungsCount = sets.filter(isPung).length;
  const areAllSuited = areSuited(setsTiles);
  const areAllSameValues = areAllSuited && areSameValues(setsTiles);
  const areAllPungs = arePungs(sets);
  const areAllKongs = areKongs(sets);
  const areAllChows = areChows(sets);
  const areWinds = setsTiles.every(isWind);
  const areDragons = setsTiles.every(isDragon);
  const areConcealedPungs = areAllPungs && sets.every(isConcealed);
  const arePureChows = areAllChows && setsTiles.every(isEqualTilesCallback(firstSetTile));
  const arePureShiftedPungs = areAllPungs && isFlush(setsTiles) && isStraight(setsTiles);
  const arePureShiftedChows = areAllChows && isFlush(setsTiles) && isStraight(setsTiles, [1, 2]);
  const isPureStraight = areAllChows && isFlush(setsTiles) && isStraight(setsTiles, [3]);
  const areSamePungs = areAllPungs && areAllSuited && areAllSameValues;
  const areMixedChows = areAllChows && areAllSuited && areAllSameValues && suitsCount === sets.length;
  const fans: EFan[] = [];

  if (sets.length === 4) {
    if (areWinds && pungsCount >= 3) {
      fans.push(areAllPungs ? EFan.BIG_FOUR_WINDS : EFan.LITTLE_FOUR_WINDS);
    }

    if (areAllKongs) {
      fans.push(EFan.FOUR_KONGS);
    }

    if (areConcealedPungs) {
      fans.push(EFan.FOUR_CONCEALED_PUNGS);
    }

    if (arePureChows) {
      fans.push(EFan.QUADRUPLE_CHOW);
    }

    if (arePureShiftedPungs) {
      fans.push(EFan.FOUR_PURE_SHIFTED_PUNGS);
    }

    if (arePureShiftedChows) {
      fans.push(EFan.FOUR_PURE_SHIFTED_CHOWS);
    }
  } else if (sets.length === 3) {
    if (areDragons && pungsCount >= 2) {
      fans.push(areAllPungs ? EFan.BIG_THREE_DRAGONS : EFan.LITTLE_THREE_DRAGONS);
    }

    if (areAllKongs) {
      fans.push(EFan.THREE_KONGS);
    }

    if (arePureChows) {
      fans.push(EFan.PURE_TRIPLE_CHOW);
    }

    if (arePureShiftedPungs) {
      fans.push(EFan.PURE_SHIFTED_PUNGS);
    }

    if (isPureStraight) {
      fans.push(EFan.PURE_STRAIGHT);
    }

    if (arePureShiftedChows) {
      fans.push(EFan.PURE_SHIFTED_CHOWS);
    }

    if (areSamePungs) {
      fans.push(EFan.TRIPLE_PUNG);
    }

    if (areConcealedPungs) {
      fans.push(EFan.THREE_CONCEALED_PUNGS);
    }

    if (sets.every(isKnittedChow)) {
      fans.push(EFan.KNITTED_STRAIGHT);
    }

    if (areWinds && areAllPungs) {
      fans.push(EFan.BIG_THREE_WINDS);
    }

    if (areAllChows && areAllSuited && suitsCount === 3 && isStraight(setsTiles, [3])) {
      fans.push(EFan.MIXED_STRAIGHT);
    }

    if (areMixedChows) {
      fans.push(EFan.MIXED_TRIPLE_CHOW);
    }

    if (areAllPungs && areAllSuited && suitsCount === 3 && isStraight(setsTiles)) {
      fans.push(EFan.MIXED_SHIFTED_PUNGS);
    }

    if (areAllChows && areAllSuited && suitsCount === 3 && isStraight(setsTiles)) {
      fans.push(EFan.MIXED_SHIFTED_CHOWS);
    }
  } else if (sets.length === 2) {
    if (areAllKongs) {
      fans.push(areConcealedPungs ? EFan.TWO_CONCEALED_KONGS : EFan.TWO_MELDED_KONGS);
    }

    if (areDragons && areAllPungs) {
      fans.push(EFan.TWO_DRAGON_PUNGS);
    }

    if (areSamePungs) {
      fans.push(EFan.DOUBLE_PUNG);
    }

    if (areConcealedPungs) {
      fans.push(EFan.TWO_CONCEALED_PUNGS);
    }

    if (arePureChows) {
      fans.push(EFan.PURE_DOUBLE_CHOW);
    }

    if (areMixedChows) {
      fans.push(EFan.MIXED_DOUBLE_CHOW);
    }

    if (isPureStraight) {
      fans.push(EFan.SHORT_STRAIGHT);
    }

    if (areAllChows && isFlush(setsTiles) && isStraight(setsTiles, [6])) {
      fans.push(EFan.TWO_TERMINAL_CHOWS);
    }
  } else if (sets.length === 1) {
    if (areDragons && areAllPungs) {
      fans.push(EFan.DRAGON_PUNG);
    }

    if (areWinds && areAllPungs) {
      if (isEqualTiles(firstSetTile, wind(roundWind))) {
        fans.push(EFan.PREVALENT_WIND);
      }

      if (isEqualTiles(firstSetTile, wind(seatWind))) {
        fans.push(EFan.SEAT_WIND);
      }
    }

    if (areAllKongs) {
      fans.push(areConcealedPungs ? EFan.CONCEALED_KONG : EFan.MELDED_KONG);
    }

    if (areAllPungs && isTerminalOrHonor(firstSetTile)) {
      fans.push(EFan.PUNG_OF_TERMINALS_OR_HONORS);
    }
  }

  return fans.map((fan) => ({
    type: EFanType.SETS,
    fan,
    sets,
  }));
}

export function getWholeHandSetsFans(sets: TSet[], isSelfDraw: boolean): TFan[] {
  const fans: EFan[] = [];
  const meldedSets = sets.filter((set) => !isConcealed(set));
  const setsTiles = sets.map(getSetTile);

  if (sets.length === 7 && sets.every(isPair)) {
    fans.push(isFlush(setsTiles) && isStraight(setsTiles) ? EFan.SEVEN_SHIFTED_PAIRS : EFan.SEVEN_PAIRS);
  }

  if (sets.length === 5) {
    const chows = sets.filter(isChow);
    const pair = sets.find(isPair);

    if (chows.length === 4 && pair) {
      const chowTiles = chows.map(getSetTile);
      const pairTile = getSetTile(pair);

      if (
        isFlush(chowTiles) &&
        isSuited(pairTile) &&
        chowTiles[0].suit === pairTile.suit &&
        getSortedValuesString(chowTiles) === '2288' &&
        pairTile.value === 5
      ) {
        fans.push(EFan.PURE_TERMINAL_CHOWS);
      }

      if (TERMINAL_CHOWS_SETS.some((chowsSets) => isEqualSetOfSets(chowsSets, sets))) {
        fans.push(EFan.THREE_SUITED_TERMINAL_CHOWS);
      }
    }

    if (sets.every(isPung) && setsTiles.every((tile) => isSuited(tile) && tile.value === 0)) {
      fans.push(EFan.ALL_EVEN_PUNGS);
    }

    if (sets.every(({ tiles }) => tiles.some((tile) => isSuited(tile) && tile.value === 5))) {
      fans.push(EFan.ALL_FIVES);
    }

    if (sets.every((set) => isPung(set) || isPair(set))) {
      fans.push(EFan.ALL_PUNGS);
    }

    if (sets.every((set) => (isChow(set) || isPair(set)) && !isHonor(getSetTile(set)))) {
      fans.push(EFan.ALL_CHOWS);
    }
  }

  if (
    ALL_SUITS.every((suit) => setsTiles.some((tile) => isSuited(tile) && tile.suit === suit)) &&
    setsTiles.some(isDragon) &&
    setsTiles.some(isWind)
  ) {
    fans.push(EFan.ALL_TYPES);
  }

  if (meldedSets.length === 0) {
    fans.push(EFan.FULLY_CONCEALED_HAND);
  } else if (meldedSets.length === 1 && !isSelfDraw) {
    fans.push(EFan.CONCEALED_HAND);
  } else if (meldedSets.length === sets.length) {
    fans.push(EFan.MELDED_HAND);
  }

  if (sets.every((set) => set.tiles.some(isTerminalOrHonor))) {
    fans.push(EFan.OUTSIDE_HAND);
  }

  return fans.map((fan) => ({
    type: EFanType.HAND,
    fan,
  }));
}

export function getWholeHandFans(hand: TTile[]): TFan[] {
  const noDeclaredSets = hand.length === 14;
  const handWithoutWinningTile = hand.slice(0, -1);
  const winningTile = hand.at(-1);
  const suitsCount = getSuitsCount(hand);

  if (!winningTile) {
    return [];
  }

  const fans: EFan[] = [];

  if (isTileSubset(ORPHANS, hand) && isTileSubset(hand, ORPHANS)) {
    fans.push(EFan.THIRTEEN_ORPHANS);
  }

  const isHonorsAndKnittedTiles =
    noDeclaredSets &&
    hand.every((tile, index) => hand.every((tile2, index2) => index === index2 || !isEqualTiles(tile, tile2))) &&
    KNITTED_SEQUENCES.some((sets) => {
      const knittedTiles = sets.flat();

      return hand.every((tile) => isHonor(tile) || tilesContainTile(knittedTiles, tile));
    });

  if (isHonorsAndKnittedTiles) {
    fans.push(
      hand.filter(isHonor).length === 7 ? EFan.GREATER_HONORS_AND_KNITTED_TILES : EFan.LESSER_HONORS_AND_KNITTED_TILES,
    );
  }

  if (isTileSubset(hand, GREEN_TILES)) {
    fans.push(EFan.ALL_GREEN);
  }

  if (
    noDeclaredSets &&
    isSuited(winningTile) &&
    isFlush(handWithoutWinningTile) &&
    getSortedValuesString(handWithoutWinningTile) === '1112345678999'
  ) {
    fans.push(EFan.NINE_GATES);
  }

  if (hand.every(isTerminal)) {
    fans.push(EFan.ALL_TERMINALS);
  } else if (hand.every(isHonor)) {
    fans.push(EFan.ALL_HONORS);
  } else if (hand.every(isTerminalOrHonor)) {
    fans.push(EFan.ALL_TERMINALS_AND_HONORS);
  }

  if (suitsCount === 1) {
    fans.push(areSuited(hand) ? EFan.FULL_FLUSH : EFan.HALF_FLUSH);
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

  if (hand.every((tile) => !isTerminalOrHonor(tile))) {
    fans.push(EFan.ALL_SIMPLES);
  }

  if (suitsCount === 2) {
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

export function getSpecialSetsFans(sets: TSet[], winningTile: TTile, waits: TTile[]): TFan[] {
  const fans: TFan[] = [];

  const tileHogFans: TFan[] = getTileHogs(sets).map((tile) => ({
    type: EFanType.SPECIAL,
    fan: EFan.TILE_HOG,
    tile,
  }));

  fans.push(...tileHogFans);

  if (waits.length === 1) {
    const winningMeldedSet = sets.find(({ concealedType }) => concealedType === ESetConcealedType.WINNING_MELDED);
    const winningSets = winningMeldedSet
      ? [winningMeldedSet]
      : sets.filter((set) => isConcealed(set) && tilesContainTile(set.tiles, winningTile));
    const waitTypes: (EFan | undefined)[] = winningSets.map((set) => {
      if (isPair(set)) {
        return EFan.SINGLE_WAIT;
      }

      if (!isChow(set) || !isSuited(winningTile)) {
        return;
      }

      const setTile = getSetTile(set);

      if (isEqualTiles(setTile, winningTile)) {
        return EFan.CLOSED_WAIT;
      }

      if ((setTile.value === 2 && winningTile.value === 3) || (setTile.value === 8 && winningTile.value === 7)) {
        return EFan.EDGE_WAIT;
      }
    });

    if (waitTypes.every(isDefined)) {
      const waitFans: TFan[] = waitTypes.slice(0, 1).map((waitFan) => ({
        type: EFanType.SPECIAL,
        fan: waitFan,
        tile: null,
      }));

      fans.push(...waitFans);
    }
  }

  return fans;
}

export function getSpecialFans(options: IHandScoreFullOptions): TFan[] {
  const fans: TFan[] = [];

  if (options.isLastWallTile) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: options.isSelfDraw ? EFan.LAST_TILE_DRAW : EFan.LAST_TILE_CLAIM,
      tile: null,
    });
  }

  if (options.isReplacementTile) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.OUT_WITH_REPLACEMENT_TILE,
      tile: null,
    });
  }

  if (options.isRobbingKong) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.ROBBING_THE_KONG,
      tile: null,
    });
  }

  if (options.isLastTile) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.LAST_TILE,
      tile: null,
    });
  }

  if (options.isSelfDraw) {
    fans.push({
      type: EFanType.SPECIAL,
      fan: EFan.SELF_DRAWN,
      tile: null,
    });
  }

  const flowerFans: TFan[] = options.flowers.map((flower) => ({
    type: EFanType.SPECIAL,
    fan: EFan.FLOWER_TILES,
    tile: flower,
  }));

  fans.push(...flowerFans);

  return fans;
}

export function canAddFan(fans: TFan[], fan: TFan): boolean {
  return (
    isNonIdenticalPrincipleKept(fans, fan) &&
    isAccountOncePrincipleKept([...fans, fan]) &&
    fans.every((includedFan) => isNonRepeatPrincipleKept(fan, includedFan))
  );
}

function isNonRepeatPrincipleKept(fan1: TFan, fan2: TFan): boolean {
  return !isImplied(fan1, fan2) && !isImplied(fan2, fan1);
}

function isNonIdenticalPrincipleKept(fans: TFan[], fan: TFan): boolean {
  if (!isSetsFan(fan)) {
    return true;
  }

  return fans.every((includedFan) => {
    if (!isSetsFan(includedFan) || includedFan.fan !== fan.fan) {
      return true;
    }

    return includedFan.sets.filter((set) => fan.sets.includes(set)).length === 0;
  });
}

function isAccountOncePrincipleKept(fans: TFan[]): boolean {
  const setsFans = fans.filter(isSetsFan).filter((fan) => fan.sets.length > 1);

  return setsFans.every((fan, fanIndex) =>
    fan.sets.every(
      (set) =>
        setsFans
          .slice(fanIndex + 1)
          .filter((otherFan) => otherFan.sets.includes(set) && fan.sets.some((set) => !otherFan.sets.includes(set)))
          .length <= 1,
    ),
  );
}

function isImplied(mainFan: TFan, secondaryFan: TFan): boolean {
  const impliedFans = IMPLIED_FANS[mainFan.fan];

  if (!impliedFans?.includes(secondaryFan.fan)) {
    return false;
  }

  if (!isSetsFan(secondaryFan) || !isSetsFan(mainFan)) {
    return true;
  }

  return secondaryFan.sets.every((set) => mainFan.sets.includes(set));
}
