import { ALL_SUITS, GREEN_TILES, KNITTED_SEQUENCES, ORPHANS, REVERSIBLE_TILES } from '../../constants/games/mahjong';
import { FAN_SCORES } from '../../constants/games/mahjong/fans';

import { EFan, EFanType, EWind, ISet, TTile } from 'common/types/mahjong';

import {
  areChows,
  areKongs,
  arePungs,
  getSetsCombinations,
  getSetsVariations,
  getSetTile,
  isChow,
  isKnittedChow,
  isPair,
  isPung,
} from 'common/utilities/mahjong/sets';

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
} from './tiles';

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

  let mahjong: IHandMahjong | undefined;

  if (setsVariations.length > 0) {
    setsVariations.forEach((sets) => {
      const wholeHandSetsFans = getWholeHandSetsFans(sets, options.isSelfDraw);
      const setsFans: TFan[] = [];

      getSetsCombinations(sets).forEach((sets) => {
        setsFans.push(...getSetsFans(sets));
      });

      const fans = [...wholeHandFans, ...wholeHandSetsFans, ...setsFans, ...specialFans];

      if (fans.every((fan) => fan.fan === EFan.FLOWER_TILES)) {
        fans.push({
          type: EFanType.HAND,
          fan: EFan.CHICKEN_HAND,
        });
      }

      const fansMahjong = getBestFansMahjong([...wholeHandFans, ...wholeHandSetsFans, ...setsFans, ...specialFans]);

      if (!mahjong || fansMahjong.score > mahjong.score) {
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

function getSetsFans(sets: ISet[]): TFan[] {
  const firstSet = sets.at(0);

  if (!firstSet) {
    return [];
  }

  const setsTiles = sets.map(getSetTile);
  const firstSetTile = getSetTile(firstSet);
  const suitsCount = getSuitsCount(setsTiles);
  const areAllSuited = areSuited(setsTiles);
  const areAllSameValues = areAllSuited && areSameValues(setsTiles);
  const areAllPungs = arePungs(sets);
  const areAllKongs = areKongs(sets);
  const areAllChows = areChows(sets);
  const areWinds = setsTiles.every(isWind);
  const areDragons = setsTiles.every(isDragon);
  const areConcealedPungs = areAllPungs && sets.every((set) => set.concealed);
  const arePureChows = areAllChows && setsTiles.every(isEqualTilesCallback(firstSetTile));
  const arePureShiftedPungs = areAllPungs && isFlush(setsTiles) && isStraight(setsTiles);
  const arePureShiftedChows = areAllChows && isFlush(setsTiles) && isStraight(setsTiles, [1, 2]);
  const isPureStraight = areAllChows && isFlush(setsTiles) && isStraight(setsTiles, [3]);
  const areSamePungs = areAllPungs && areAllSuited && areAllSameValues;
  const areMixedChows = areAllChows && areAllSuited && areAllSameValues && suitsCount === sets.length;
  const fans: EFan[] = [];

  if (sets.length === 4) {
    if (areWinds) {
      fans.push(areAllPungs ? EFan.BIG_FOUR_WINDS : EFan.LITTLE_FOUR_WINDS);
    }

    if (areAllKongs) {
      fans.push(EFan.FOUR_KONGS);
    }

    if (areConcealedPungs) {
      fans.push(EFan.FOUR_CONCEALED_PUNGS);
    }

    if (arePureChows) {
      fans.push(EFan.QUADRUPLE_CHOWS);
    }

    if (arePureShiftedPungs) {
      fans.push(EFan.FOUR_PURE_SHIFTED_PUNGS);
    }

    if (arePureShiftedChows) {
      fans.push(EFan.FOUR_PURE_SHIFTED_CHOWS);
    }
  } else if (sets.length === 3) {
    if (areDragons) {
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

    // TODO: prevalent wind
    // TODO: seat wind

    if (areAllKongs) {
      fans.push(areConcealedPungs ? EFan.CONCEALED_KONG : EFan.MELDED_KONG);
    }

    if (areAllPungs && isHonor(firstSetTile)) {
      fans.push(EFan.PUNG_OF_TERMINALS_OR_HONORS);
    }
  }

  return fans.map((fan) => ({
    type: EFanType.SETS,
    fan,
    sets,
  }));
}

function getWholeHandSetsFans(sets: ISet[], isSelfDraw: boolean): TFan[] {
  const fans: EFan[] = [];
  const meldedSets = sets.filter(({ concealed }) => !concealed);
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

      // TODO: three-suited terminal chows
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

function getWholeHandFans(hand: TTile[]): TFan[] {
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

function getSpecialFans(options: IHandScoreOptions): TFan[] {
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

function getBestFansMahjong(fans: TFan[]): IHandMahjong {
  const pickedFans: TFan[] = [];
  // TODO: implied fans

  return { fans: pickedFans, score: pickedFans.reduce((score, { fan }) => score + FAN_SCORES[fan], 0) };
}
