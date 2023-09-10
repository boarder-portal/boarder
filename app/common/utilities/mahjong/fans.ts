import { ALL_SUITS } from 'common/constants/games/mahjong';
import { FAN_SCORES, IMPLIED_FANS } from 'common/constants/games/mahjong/fans';
import {
  GREEN_TILES,
  KNITTED_SEQUENCES,
  ORPHANS,
  REVERSIBLE_TILES,
  TERMINAL_CHOWS_SETS,
} from 'common/constants/games/mahjong/tiles';

import {
  Fan,
  FanKind,
  FanType,
  HandFan,
  PlayableTile,
  Set,
  SetConcealedType,
  SetsFan,
  SpecialFan,
  WindSide,
} from 'common/types/mahjong';

import isDefined from 'common/utilities/isDefined';
import { HandScoreFullOptions } from 'common/utilities/mahjong/scoring';
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
import {
  areSameValues,
  areSuited,
  getSortedValuesString,
  getSuitsCount,
  getTileCount,
  isEqualTiles,
  isEqualTilesCallback,
  isFlush,
  isHonor,
  isStraight,
  isTerminal,
  isTerminalOrHonor,
  isTileSubset,
  tilesContainTile,
} from 'common/utilities/mahjong/tiles';
import { isDragon, isSuited, isWind, wind } from 'common/utilities/mahjong/tilesBase';

export function isHandFan(fan: Fan): fan is HandFan {
  return fan.type === FanType.HAND;
}

export function isSetsFan(fan: Fan): fan is SetsFan {
  return fan.type === FanType.SETS;
}

export function isSpecialFan(fan: Fan): fan is SpecialFan {
  return fan.type === FanType.SPECIAL;
}

export function getFanScore(fan: Fan): number {
  return FAN_SCORES[fan.fan];
}

export function getFansScore(fans: Fan[]): number {
  return fans.reduce((score, fan) => score + getFanScore(fan), 0);
}

export function getSetsFans(sets: Set[], seatWind: WindSide | null, roundWind: WindSide | null): Fan[] {
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
  const fans: FanKind[] = [];

  if (sets.length === 4) {
    if (areWinds && pungsCount >= 3) {
      fans.push(areAllPungs ? FanKind.BIG_FOUR_WINDS : FanKind.LITTLE_FOUR_WINDS);
    }

    if (areAllKongs) {
      fans.push(FanKind.FOUR_KONGS);
    }

    if (areConcealedPungs) {
      fans.push(FanKind.FOUR_CONCEALED_PUNGS);
    }

    if (arePureChows) {
      fans.push(FanKind.QUADRUPLE_CHOW);
    }

    if (arePureShiftedPungs) {
      fans.push(FanKind.FOUR_PURE_SHIFTED_PUNGS);
    }

    if (arePureShiftedChows) {
      fans.push(FanKind.FOUR_PURE_SHIFTED_CHOWS);
    }
  } else if (sets.length === 3) {
    if (areDragons && pungsCount >= 2) {
      fans.push(areAllPungs ? FanKind.BIG_THREE_DRAGONS : FanKind.LITTLE_THREE_DRAGONS);
    }

    if (areAllKongs) {
      fans.push(FanKind.THREE_KONGS);
    }

    if (arePureChows) {
      fans.push(FanKind.PURE_TRIPLE_CHOW);
    }

    if (arePureShiftedPungs) {
      fans.push(FanKind.PURE_SHIFTED_PUNGS);
    }

    if (isPureStraight) {
      fans.push(FanKind.PURE_STRAIGHT);
    }

    if (arePureShiftedChows) {
      fans.push(FanKind.PURE_SHIFTED_CHOWS);
    }

    if (areSamePungs) {
      fans.push(FanKind.TRIPLE_PUNG);
    }

    if (areConcealedPungs) {
      fans.push(FanKind.THREE_CONCEALED_PUNGS);
    }

    if (sets.every(isKnittedChow)) {
      fans.push(FanKind.KNITTED_STRAIGHT);
    }

    if (areWinds && areAllPungs) {
      fans.push(FanKind.BIG_THREE_WINDS);
    }

    if (areAllChows && areAllSuited && suitsCount === 3 && isStraight(setsTiles, [3])) {
      fans.push(FanKind.MIXED_STRAIGHT);
    }

    if (areMixedChows) {
      fans.push(FanKind.MIXED_TRIPLE_CHOW);
    }

    if (areAllPungs && areAllSuited && suitsCount === 3 && isStraight(setsTiles)) {
      fans.push(FanKind.MIXED_SHIFTED_PUNGS);
    }

    if (areAllChows && areAllSuited && suitsCount === 3 && isStraight(setsTiles)) {
      fans.push(FanKind.MIXED_SHIFTED_CHOWS);
    }
  } else if (sets.length === 2) {
    if (areAllKongs) {
      fans.push(areConcealedPungs ? FanKind.TWO_CONCEALED_KONGS : FanKind.TWO_MELDED_KONGS);
    }

    if (areDragons && areAllPungs) {
      fans.push(FanKind.TWO_DRAGON_PUNGS);
    }

    if (areSamePungs) {
      fans.push(FanKind.DOUBLE_PUNG);
    }

    if (areConcealedPungs) {
      fans.push(FanKind.TWO_CONCEALED_PUNGS);
    }

    if (arePureChows) {
      fans.push(FanKind.PURE_DOUBLE_CHOW);
    }

    if (areMixedChows) {
      fans.push(FanKind.MIXED_DOUBLE_CHOW);
    }

    if (isPureStraight) {
      fans.push(FanKind.SHORT_STRAIGHT);
    }

    if (areAllChows && isFlush(setsTiles) && isStraight(setsTiles, [6])) {
      fans.push(FanKind.TWO_TERMINAL_CHOWS);
    }
  } else if (sets.length === 1) {
    if (areDragons && areAllPungs) {
      fans.push(FanKind.DRAGON_PUNG);
    }

    if (areWinds && areAllPungs) {
      if (roundWind && isEqualTiles(firstSetTile, wind(roundWind))) {
        fans.push(FanKind.PREVALENT_WIND);
      }

      if (seatWind && isEqualTiles(firstSetTile, wind(seatWind))) {
        fans.push(FanKind.SEAT_WIND);
      }
    }

    if (areAllKongs) {
      fans.push(areConcealedPungs ? FanKind.CONCEALED_KONG : FanKind.MELDED_KONG);
    }

    if (areAllPungs && isTerminalOrHonor(firstSetTile)) {
      fans.push(FanKind.PUNG_OF_TERMINALS_OR_HONORS);
    }
  }

  return fans.map((fan) => ({
    type: FanType.SETS,
    fan,
    sets,
  }));
}

export function getWholeHandSetsFans(sets: Set[], isSelfDraw: boolean): Fan[] {
  const fans: FanKind[] = [];
  const meldedSets = sets.filter((set) => !isConcealed(set));
  const setsTiles = sets.map(getSetTile);

  if (sets.length === 7 && sets.every(isPair)) {
    fans.push(isFlush(setsTiles) && isStraight(setsTiles) ? FanKind.SEVEN_SHIFTED_PAIRS : FanKind.SEVEN_PAIRS);
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
        fans.push(FanKind.PURE_TERMINAL_CHOWS);
      }

      if (TERMINAL_CHOWS_SETS.some((chowsSets) => isEqualSetOfSets(chowsSets, sets))) {
        fans.push(FanKind.THREE_SUITED_TERMINAL_CHOWS);
      }
    }

    if (
      sets.every((set) => isPung(set) || isPair(set)) &&
      setsTiles.every((tile) => isSuited(tile) && tile.value % 2 === 0)
    ) {
      fans.push(FanKind.ALL_EVEN_PUNGS);
    }

    if (sets.every(({ tiles }) => tiles.some((tile) => isSuited(tile) && tile.value === 5))) {
      fans.push(FanKind.ALL_FIVES);
    }

    if (sets.every((set) => isPung(set) || isPair(set))) {
      fans.push(FanKind.ALL_PUNGS);
    }

    if (sets.every((set) => (isChow(set) || isKnittedChow(set) || isPair(set)) && !isHonor(getSetTile(set)))) {
      fans.push(FanKind.ALL_CHOWS);
    }
  }

  if (
    ALL_SUITS.every((suit) => setsTiles.some((tile) => isSuited(tile) && tile.suit === suit)) &&
    setsTiles.some(isDragon) &&
    setsTiles.some(isWind)
  ) {
    fans.push(FanKind.ALL_TYPES);
  }

  if (meldedSets.length === 0) {
    fans.push(FanKind.FULLY_CONCEALED_HAND);
  } else if (meldedSets.length === 1 && !isSelfDraw) {
    fans.push(FanKind.CONCEALED_HAND);
  } else if (meldedSets.length === sets.length) {
    fans.push(FanKind.MELDED_HAND);
  }

  if (sets.every((set) => set.tiles.some(isTerminalOrHonor))) {
    fans.push(FanKind.OUTSIDE_HAND);
  }

  return fans.map((fan) => ({
    type: FanType.HAND,
    fan,
  }));
}

export function getWholeHandFans(hand: PlayableTile[]): Fan[] {
  const noDeclaredSets = hand.length === 14;
  const handWithoutWinningTile = hand.slice(0, -1);
  const winningTile = hand.at(-1);
  const suitsCount = getSuitsCount(hand);

  if (!winningTile) {
    return [];
  }

  const fans: FanKind[] = [];

  if (isTileSubset(ORPHANS, hand) && isTileSubset(hand, ORPHANS)) {
    fans.push(FanKind.THIRTEEN_ORPHANS);
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
      hand.filter(isHonor).length === 7
        ? FanKind.GREATER_HONORS_AND_KNITTED_TILES
        : FanKind.LESSER_HONORS_AND_KNITTED_TILES,
    );
  }

  if (isTileSubset(hand, GREEN_TILES)) {
    fans.push(FanKind.ALL_GREEN);
  }

  if (
    noDeclaredSets &&
    isSuited(winningTile) &&
    isFlush(handWithoutWinningTile) &&
    getSortedValuesString(handWithoutWinningTile) === '1112345678999'
  ) {
    fans.push(FanKind.NINE_GATES);
  }

  if (hand.every(isTerminal)) {
    fans.push(FanKind.ALL_TERMINALS);
  } else if (hand.every(isHonor)) {
    fans.push(FanKind.ALL_HONORS);
  } else if (hand.every(isTerminalOrHonor)) {
    fans.push(FanKind.ALL_TERMINALS_AND_HONORS);
  }

  if (suitsCount === 1) {
    fans.push(areSuited(hand) ? FanKind.FULL_FLUSH : FanKind.HALF_FLUSH);
  }

  if (hand.every((tile) => isSuited(tile) && tile.value >= 7)) {
    fans.push(FanKind.UPPER_TILES);
  } else if (hand.every((tile) => isSuited(tile) && tile.value >= 4 && tile.value <= 6)) {
    fans.push(FanKind.MIDDLE_TILES);
  } else if (hand.every((tile) => isSuited(tile) && tile.value <= 3)) {
    fans.push(FanKind.LOWER_TILES);
  } else if (hand.every((tile) => isSuited(tile) && tile.value >= 6)) {
    fans.push(FanKind.UPPER_FOUR);
  } else if (hand.every((tile) => isSuited(tile) && tile.value <= 4)) {
    fans.push(FanKind.LOWER_FOUR);
  }

  if (isTileSubset(hand, REVERSIBLE_TILES)) {
    fans.push(FanKind.REVERSIBLE_TILES);
  }

  if (hand.every((tile) => !isTerminalOrHonor(tile))) {
    fans.push(FanKind.ALL_SIMPLES);
  }

  if (suitsCount === 2) {
    fans.push(FanKind.ONE_VOIDED_SUIT);
  }

  if (hand.every((tile) => !isHonor(tile))) {
    fans.push(FanKind.NO_HONORS);
  }

  return fans.map((fan) => ({
    type: FanType.HAND,
    fan,
  }));
}

export function getSpecialSetsFans(sets: Set[], winningTile: PlayableTile, waits: PlayableTile[]): Fan[] {
  const fans: Fan[] = [];

  const tileHogFans: Fan[] = getTileHogs(sets).map((tile) => ({
    type: FanType.SPECIAL,
    fan: FanKind.TILE_HOG,
    tile,
  }));

  fans.push(...tileHogFans);

  if (waits.length === 1) {
    const winningSets = sets.filter(
      (set) => set.concealedType !== SetConcealedType.MELDED && tilesContainTile(set.tiles, winningTile),
    );
    const waitTypes: (FanKind | undefined)[] = winningSets.map((set) => {
      if (isPair(set)) {
        return FanKind.SINGLE_WAIT;
      }

      if (!isChow(set) || !isSuited(winningTile)) {
        return;
      }

      const setTile = getSetTile(set);

      if (isEqualTiles(setTile, winningTile)) {
        return FanKind.CLOSED_WAIT;
      }

      if ((setTile.value === 2 && winningTile.value === 3) || (setTile.value === 8 && winningTile.value === 7)) {
        return FanKind.EDGE_WAIT;
      }
    });

    if (waitTypes.every(isDefined)) {
      const waitFans: Fan[] = waitTypes.slice(0, 1).map((waitFan) => ({
        type: FanType.SPECIAL,
        fan: waitFan,
        tile: null,
      }));

      fans.push(...waitFans);
    }
  }

  return fans;
}

export function getSpecialFans(
  options: HandScoreFullOptions,
  winningTile: PlayableTile,
  wholeHand: PlayableTile[],
): Fan[] {
  const fans: Fan[] = [];

  if (options.isLastWallTile) {
    fans.push({
      type: FanType.SPECIAL,
      fan: options.isSelfDraw ? FanKind.LAST_TILE_DRAW : FanKind.LAST_TILE_CLAIM,
      tile: null,
    });
  }

  if (options.isReplacementTile) {
    fans.push({
      type: FanType.SPECIAL,
      fan: FanKind.OUT_WITH_REPLACEMENT_TILE,
      tile: null,
    });
  }

  if (options.isRobbingKong && getTileCount(wholeHand, winningTile) === 1) {
    fans.push({
      type: FanType.SPECIAL,
      fan: FanKind.ROBBING_THE_KONG,
      tile: null,
    });
  }

  if (tilesContainTile(options.lastTileCandidates, winningTile)) {
    fans.push({
      type: FanType.SPECIAL,
      fan: FanKind.LAST_TILE,
      tile: null,
    });
  }

  if (options.isSelfDraw) {
    fans.push({
      type: FanType.SPECIAL,
      fan: FanKind.SELF_DRAWN,
      tile: null,
    });
  }

  const flowerFans: Fan[] = options.flowers.map((flower) => ({
    type: FanType.SPECIAL,
    fan: FanKind.FLOWER_TILES,
    tile: flower,
  }));

  fans.push(...flowerFans);

  return fans;
}

export function canAddFan(fans: Fan[], fan: Fan): boolean {
  return (
    isNonIdenticalPrincipleKept(fans, fan) &&
    isAccountOncePrincipleKept([...fans, fan]) &&
    fans.every((includedFan) => isNonRepeatPrincipleKept(fan, includedFan))
  );
}

function isNonRepeatPrincipleKept(fan1: Fan, fan2: Fan): boolean {
  return !isImplied(fan1, fan2) && !isImplied(fan2, fan1);
}

function isNonIdenticalPrincipleKept(fans: Fan[], fan: Fan): boolean {
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

function isAccountOncePrincipleKept(fans: Fan[]): boolean {
  const setsFans = fans.filter(isSetsFan).filter((fan) => fan.sets.length > 1);

  return setsFans.every(
    (fan, fanIndex) =>
      setsFans
        .slice(fanIndex + 1)
        .filter(
          (otherFan) =>
            otherFan !== fan &&
            otherFan.sets.length > 1 &&
            otherFan.sets.filter((set) => fan.sets.includes(set)).length === 1,
        ).length <= 1,
  );
}

function isImplied(mainFan: Fan, secondaryFan: Fan): boolean {
  const impliedFans = IMPLIED_FANS[mainFan.fan];

  if (!impliedFans?.includes(secondaryFan.fan)) {
    return false;
  }

  if (!isSetsFan(secondaryFan) || !isSetsFan(mainFan)) {
    return true;
  }

  return secondaryFan.sets.every((set) => mainFan.sets.includes(set));
}
