import sortBy from 'lodash/sortBy';

import { KNITTED_SEQUENCES } from 'common/constants/games/mahjong/tiles';

import {
  ChowSet,
  ConcealedSet,
  GameDeclaredConcealedSet,
  GameDeclaredMeldedSet,
  GameDeclaredSet,
  KnittedChowSet,
  KongSet,
  MeldedSet,
  PairSet,
  PlayableTile,
  PungSet,
  Set,
  SetConcealedType,
  SetType,
  SuitedTile,
  Tile,
} from 'common/types/games/mahjong';

import { getCombinations, getSetsCombinations } from 'common/utilities/combinations';
import {
  getTileCount,
  getTileSortValue,
  isEqualTiles,
  isEqualTilesCallback,
  isFlush,
  isPlayable,
  isStraight,
  isTileSubset,
  tilesContainTile,
} from 'common/utilities/games/mahjong/tiles';
import { isSuited, kong } from 'common/utilities/games/mahjong/tilesBase';

const SET_SORT_VALUES: Record<SetType, number> = {
  [SetType.KNITTED_CHOW]: 0,
  [SetType.KONG]: 1000,
  [SetType.PUNG]: 2000,
  [SetType.CHOW]: 3000,
  [SetType.PAIR]: 4000,
};

export function isPair(set: Set): set is PairSet {
  return set.type === SetType.PAIR;
}

export function isPung(set: Set): set is PungSet {
  return set.type === SetType.PUNG || set.type === SetType.KONG;
}

export function isKong(set: Set): set is KongSet {
  return set.type === SetType.KONG;
}

export function isChow(set: Set): set is ChowSet {
  return set.type === SetType.CHOW;
}

export function isKnittedChow(set: Set): set is KnittedChowSet {
  return set.type === SetType.KNITTED_CHOW;
}

export function isConcealed(set: Set): set is ConcealedSet {
  return set.concealedType === SetConcealedType.CONCEALED;
}

export function isMelded(set: Set): set is MeldedSet {
  return !isConcealed(set);
}

export function isDeclaredConcealedSet(set: GameDeclaredSet): set is GameDeclaredConcealedSet {
  return isConcealed(set.set);
}

export function isDeclaredMeldedSet(set: GameDeclaredSet): set is GameDeclaredMeldedSet {
  return isMelded(set.set);
}

export function arePungs(sets: Set[]): sets is PungSet[] {
  return sets.every(isPung);
}

export function areKongs(sets: Set[]): sets is KongSet[] {
  return sets.every(isKong);
}

export function areChows(sets: Set[]): sets is ChowSet[] {
  return sets.every(isChow);
}

export function isEqualSets(set1: Set, set2: Set): boolean {
  return (
    set1.type === set2.type &&
    set1.tiles.length === set2.tiles.length &&
    set1.tiles.every((tile, index) => isEqualTiles(tile, set2.tiles.at(index)))
  );
}

export function isEqualSetOfSets(sets1: Set[], sets2: Set[]): boolean {
  if (sets1.length !== sets2.length) {
    return false;
  }

  const sets2Copy = [...sets2];

  return sets1.every((set) => {
    const equalSetIndex = sets2Copy.findIndex((set2) => isEqualSets(set, set2));

    if (equalSetIndex === -1) {
      return false;
    }

    sets2Copy.splice(equalSetIndex, 1);

    return true;
  });
}

export function getSetTile<S extends Set>(set: S): S['tiles'][number] {
  return set.type === SetType.CHOW || set.type === SetType.KNITTED_CHOW ? set.tiles[1] : set.tiles[0];
}

export function getSetSortValue(set: Set): number {
  if (isKnittedChow(set)) {
    return getSetTile(set).value;
  }

  return SET_SORT_VALUES[set.type] + getTileSortValue(getSetTile(set));
}

export interface SetsVariationsOptions {
  hand: PlayableTile[];
  declaredSets: Set[];
  isSelfDraw: boolean;
}

export function getSetsVariations(options: SetsVariationsOptions): Set[][] {
  const sortedHand = sortBy(options.hand, getTileSortValue);
  const winningTile = options.hand.at(-1);

  if (!winningTile) {
    return [];
  }

  const setsVariations = splitIntoSets({
    hand: sortedHand,
    pairsFound: 0,
    allPairsAllowed: sortedHand.length === 14,
  });

  return setsVariations
    .flatMap((sets) => {
      if (options.isSelfDraw) {
        return [[...options.declaredSets, ...sets]];
      }

      const variations: Set[][] = [];

      sets.forEach((set, setIndex) => {
        if (tilesContainTile(set.tiles, winningTile)) {
          variations.push([
            ...sets.slice(0, setIndex),
            {
              ...set,
              concealedType: SetConcealedType.WINNING_MELDED,
            },
            ...sets.slice(setIndex + 1),
          ]);
        }
      });

      return variations.map((sets) => [...options.declaredSets, ...sets]);
    })
    .map((sets) => sortBy(sets, getSetSortValue));
}

export function getAllSetsCombinations(sets: Set[]): Set[][] {
  return getSetsCombinations(sets.map((set) => [[set], []])).map((sets) => sets.flat());
}

interface SplitSetsOptions {
  hand: PlayableTile[];
  pairsFound: number;
  allPairsAllowed: boolean;
}

function splitIntoSets(options: SplitSetsOptions): Set[][] {
  const { hand, pairsFound, allPairsAllowed } = options;

  const firstTile = hand.at(0);

  if (!firstTile) {
    return [[]];
  }

  const sets: Set[][] = [];

  if (pairsFound === 0 || allPairsAllowed) {
    const hasPair = isEqualTiles(firstTile, hand.at(1));

    if (hasPair) {
      sets.push(
        ...splitIntoSets({
          hand: hand.slice(2),
          pairsFound: pairsFound + 1,
          allPairsAllowed,
        }).map((sets) => [
          {
            type: SetType.PAIR,
            tiles: hand.slice(0, 2),
            concealedType: SetConcealedType.CONCEALED,
          } as const,
          ...sets,
        ]),
      );
    }
  }

  if (pairsFound <= 1) {
    const hasPung = isEqualTiles(firstTile, hand.at(2));

    if (hasPung) {
      sets.push(
        ...splitIntoSets({
          hand: hand.slice(3),
          pairsFound,
          allPairsAllowed: false,
        }).map((sets) => [
          {
            type: SetType.PUNG,
            tiles: hand.slice(0, 3),
            concealedType: SetConcealedType.CONCEALED,
          } as const,
          ...sets,
        ]),
      );
    }

    if (isSuited(firstTile)) {
      const higherBy1TileIndex = hand.findIndex(
        (tile) => isSuited(tile) && tile.suit === firstTile.suit && tile.value === firstTile.value + 1,
      );

      if (higherBy1TileIndex !== -1) {
        const higherBy2TileIndex = hand.findIndex(
          (tile) => isSuited(tile) && tile.suit === firstTile.suit && tile.value === firstTile.value + 2,
        );

        if (higherBy2TileIndex !== -1) {
          sets.push(
            ...splitIntoSets({
              hand: [
                ...hand.slice(1, higherBy1TileIndex),
                ...hand.slice(higherBy1TileIndex + 1, higherBy2TileIndex),
                ...hand.slice(higherBy2TileIndex + 1),
              ],
              pairsFound,
              allPairsAllowed: false,
            }).map((sets) => [
              {
                type: SetType.CHOW,
                tiles: [firstTile, hand[higherBy1TileIndex] as SuitedTile, hand[higherBy2TileIndex] as SuitedTile],
                concealedType: SetConcealedType.CONCEALED,
              },
              ...sets,
            ]),
          );
        }
      }

      if (hand.length >= 9) {
        const knittedSequence = KNITTED_SEQUENCES.find((knittedChows) => {
          return (
            knittedChows.some((knittedChow) => tilesContainTile(knittedChow, firstTile)) &&
            knittedChows.every((knittedChow) => isTileSubset(knittedChow, hand))
          );
        });

        if (knittedSequence) {
          const knittedTiles = knittedSequence.flat();
          const restHand = hand.filter((tile) => {
            const tileIndex = knittedTiles.findIndex(isEqualTilesCallback(tile));

            if (tileIndex === -1) {
              return true;
            }

            knittedTiles.splice(tileIndex, 1);

            return false;
          });

          sets.push(
            ...splitIntoSets({
              hand: restHand,
              pairsFound,
              allPairsAllowed: false,
            }).map((sets) => [
              ...knittedSequence.map((tiles) => ({
                type: SetType.KNITTED_CHOW,
                tiles,
                concealedType: SetConcealedType.CONCEALED,
              })),
              ...sets,
            ]),
          );
        }
      }
    }
  }

  return sets;
}

export function getTileHogs(sets: Set[]): PlayableTile[] {
  const tileHogs: PlayableTile[] = [];

  sets
    .flatMap(({ tiles }) => tiles)
    .forEach((tile, _, tiles) => {
      if (tilesContainTile(tileHogs, tile)) {
        return;
      }

      if (sets.some((set) => isKong(set) && isEqualTiles(getSetTile(set), tile))) {
        return;
      }

      if (getTileCount(tiles, tile) === 4) {
        tileHogs.push(tile);
      }
    });

  return tileHogs;
}

export function getPossibleKongs(hand: Tile[], declaredSets: GameDeclaredSet[]): KongSet[] {
  const possibleSets: KongSet[] = [];

  hand.forEach((tile, index) => {
    if (getTileCount(hand.slice(index + 1), tile) === 3 && isPlayable(tile)) {
      possibleSets.push({
        type: SetType.KONG,
        tiles: kong(tile),
        concealedType: SetConcealedType.CONCEALED,
      });
    }
  });

  declaredSets.forEach(({ set }) => {
    if (!isPung(set)) {
      return;
    }

    const pungTile = getSetTile(set);

    if (tilesContainTile(hand, pungTile)) {
      possibleSets.push({
        type: SetType.KONG,
        tiles: kong(pungTile),
        concealedType: SetConcealedType.MELDED,
      });
    }
  });

  return possibleSets;
}

export function getPossibleMeldedSets(hand: Tile[], discardedTile: PlayableTile, isChowPossible: boolean): MeldedSet[] {
  const possibleSets: MeldedSet[] = [];
  const allPossibleSets = getCombinations(sortBy([...hand, discardedTile], getTileSortValue), 3);

  const addSet = (setToAdd: MeldedSet) => {
    if (possibleSets.every((set) => !isEqualSets(set, setToAdd))) {
      possibleSets.push(setToAdd);
    }
  };

  allPossibleSets.forEach((tiles) => {
    if (tiles.every(isEqualTilesCallback(discardedTile)) && tiles.every(isPlayable)) {
      addSet({
        type: SetType.PUNG,
        tiles,
        concealedType: SetConcealedType.MELDED,
      });
    } else if (isChowPossible && tilesContainTile(tiles, discardedTile) && isFlush(tiles) && isStraight(tiles)) {
      addSet({
        type: SetType.CHOW,
        tiles,
        concealedType: SetConcealedType.MELDED,
      });
    }
  });

  if (getTileCount(hand, discardedTile) === 3) {
    possibleSets.push({
      type: SetType.KONG,
      tiles: kong(discardedTile),
      concealedType: SetConcealedType.MELDED,
    });
  }

  return sortBy(possibleSets, getSetSortValue);
}
