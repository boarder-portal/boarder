import sortBy from 'lodash/sortBy';

import { KNITTED_SEQUENCES } from 'common/constants/games/mahjong';

import {
  ESet,
  ESetConcealedType,
  IChowSet,
  IDeclaredConcealedSet,
  IDeclaredMeldedSet,
  IKnittedChowSet,
  IKongSet,
  IPairSet,
  IPungSet,
  ISuitedTile,
  TConcealedSet,
  TDeclaredSet,
  TMeldedSet,
  TPlayableTile,
  TSet,
} from 'common/types/mahjong';

import {
  getTileSortValue,
  isEqualTiles,
  isEqualTilesCallback,
  isSuited,
  isTileSubset,
  tilesContainTile,
} from 'common/utilities/mahjong/tiles';
import { getAllCombinations } from 'common/utilities/combinations';

const SET_SORT_VALUES: Record<ESet, number> = {
  [ESet.KNITTED_CHOW]: 0,
  [ESet.KONG]: 1000,
  [ESet.PUNG]: 2000,
  [ESet.CHOW]: 3000,
  [ESet.PAIR]: 4000,
};

export function isPair(set: TSet): set is IPairSet {
  return set.type === ESet.PAIR;
}

export function isPung(set: TSet): set is IPungSet {
  return set.type === ESet.PUNG || set.type === ESet.KONG;
}

export function isKong(set: TSet): set is IKongSet {
  return set.type === ESet.KONG;
}

export function isChow(set: TSet): set is IChowSet {
  return set.type === ESet.CHOW;
}

export function isKnittedChow(set: TSet): set is IKnittedChowSet {
  return set.type === ESet.KNITTED_CHOW;
}

export function isConcealed(set: TSet): set is TConcealedSet {
  return set.concealedType === ESetConcealedType.CONCEALED;
}

export function isMelded(set: TSet): set is TMeldedSet {
  return !isConcealed(set);
}

export function isDeclaredConcealedSet(set: TDeclaredSet): set is IDeclaredConcealedSet {
  return isConcealed(set.set);
}

export function isDeclaredMeldedSet(set: TDeclaredSet): set is IDeclaredMeldedSet {
  return isMelded(set.set);
}

export function arePungs(sets: TSet[]): sets is IPungSet[] {
  return sets.every(isPung);
}

export function areKongs(sets: TSet[]): sets is IKongSet[] {
  return sets.every(isKong);
}

export function areChows(sets: TSet[]): sets is IChowSet[] {
  return sets.every(isChow);
}

export function isEqualSets(set1: TSet, set2: TSet): boolean {
  return (
    set1.type === set2.type &&
    set1.tiles.length === set2.tiles.length &&
    set1.tiles.every((tile, index) => isEqualTiles(tile, set2.tiles.at(index)))
  );
}

export function isEqualSetOfSets(sets1: TSet[], sets2: TSet[]): boolean {
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

export function getSetTile<Set extends TSet>(set: Set): Set['tiles'][number] {
  return set.type === ESet.CHOW || set.type === ESet.KNITTED_CHOW ? set.tiles[1] : set.tiles[0];
}

export function getSetSortValue(set: TSet): number {
  if (isKnittedChow(set)) {
    return getSetTile(set).value;
  }

  return SET_SORT_VALUES[set.type] + getTileSortValue(getSetTile(set));
}

export interface ISetsVariationsOptions {
  hand: TPlayableTile[];
  knownSets: TSet[];
  isSelfDraw: boolean;
}

export function getSetsVariations(options: ISetsVariationsOptions): TSet[][] {
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
        return [[...options.knownSets, ...sets]];
      }

      const variations: TSet[][] = [];

      sets.forEach((set, setIndex) => {
        if (tilesContainTile(set.tiles, winningTile)) {
          variations.push([
            ...sets.slice(0, setIndex),
            {
              ...set,
              concealedType: ESetConcealedType.WINNING_MELDED,
            },
            ...sets.slice(setIndex + 1),
          ]);
        }
      });

      return variations.map((sets) => [...options.knownSets, ...sets]);
    })
    .map((sets) => sortBy(sets, getSetSortValue));
}

export function getSetsCombinations(sets: TSet[]): TSet[][] {
  return getAllCombinations(sets.map((set) => [[set], []])).map((sets) => sets.flat());
}

interface ISplitSetsOptions {
  hand: TPlayableTile[];
  pairsFound: number;
  allPairsAllowed: boolean;
}

function splitIntoSets(options: ISplitSetsOptions): TSet[][] {
  const { hand, pairsFound, allPairsAllowed } = options;

  const firstTile = hand.at(0);

  if (!firstTile) {
    return [[]];
  }

  const sets: TSet[][] = [];

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
            type: ESet.PAIR,
            tiles: hand.slice(0, 2),
            concealedType: ESetConcealedType.CONCEALED,
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
            type: ESet.PUNG,
            tiles: hand.slice(0, 3),
            concealedType: ESetConcealedType.CONCEALED,
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
                type: ESet.CHOW,
                tiles: [firstTile, hand[higherBy1TileIndex] as ISuitedTile, hand[higherBy2TileIndex] as ISuitedTile],
                concealedType: ESetConcealedType.CONCEALED,
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
                type: ESet.KNITTED_CHOW,
                tiles,
                concealedType: ESetConcealedType.CONCEALED,
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

export function getTileHogs(sets: TSet[]): TPlayableTile[] {
  const tileHogs: TPlayableTile[] = [];

  sets
    .flatMap(({ tiles }) => tiles)
    .forEach((tile, _, tiles) => {
      if (tilesContainTile(tileHogs, tile)) {
        return;
      }

      if (sets.some((set) => isKong(set) && isEqualTiles(getSetTile(set), tile))) {
        return;
      }

      if (tiles.filter(isEqualTilesCallback(tile)).length === 4) {
        tileHogs.push(tile);
      }
    });

  return tileHogs;
}
