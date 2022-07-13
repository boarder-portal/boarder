import sortBy from 'lodash/sortBy';

import { KNITTED_SEQUENCES } from 'common/constants/games/mahjong';

import { ESet, ISet, TTile } from 'common/types/mahjong';

import {
  getTileSortValue,
  isEqualTiles,
  isEqualTilesCallback,
  isSuited,
  isTileSubset,
  tilesContainTile,
} from 'common/utilities/mahjong/tiles';
import { getAllCombinations } from 'common/utilities/combinations';

export function isPair(set: ISet): boolean {
  return set.type === ESet.PAIR;
}

export function isPung(set: ISet): boolean {
  return set.type === ESet.PUNG || set.type === ESet.KONG;
}

export function isKong(set: ISet): boolean {
  return set.type === ESet.KONG;
}

export function isChow(set: ISet): boolean {
  return set.type === ESet.CHOW;
}

export function isKnittedChow(set: ISet): boolean {
  return set.type === ESet.KNITTED_CHOW;
}

export function getSetTile(set: ISet): TTile {
  return set.type === ESet.CHOW || set.type === ESet.KNITTED_CHOW ? set.tiles[1] : set.tiles[0];
}

export interface ISetsVariationsOptions {
  hand: TTile[];
  knownSets: ISet[];
  isSelfDraw: boolean;
}

export function getSetsVariations(options: ISetsVariationsOptions): ISet[][] {
  const sortedHand = sortBy(options.hand, getTileSortValue);
  const winningTile = sortedHand.at(-1);

  if (!winningTile) {
    return [];
  }

  const setsVariations = splitIntoSets({
    hand: sortedHand,
    pairsFound: 0,
    allPairsAllowed: sortedHand.length === 14,
  });

  return setsVariations.flatMap((sets) => {
    if (options.isSelfDraw) {
      return [[...options.knownSets, ...sets]];
    }

    const variations: ISet[][] = [];

    sets.forEach((set, setIndex) => {
      if (tilesContainTile(set.tiles, winningTile)) {
        variations.push([
          ...sets.slice(0, setIndex),
          {
            ...set,
            concealed: false,
          },
          ...sets.slice(setIndex + 1),
        ]);
      }
    });

    return variations.map((sets) => [...options.knownSets, ...sets]);
  });
}

export function getSetsCombinations(sets: ISet[]): ISet[][] {
  return getAllCombinations(sets.map((set) => [[set], []])).map((sets) => sets.flat());
}

interface ISplitSetsOptions {
  hand: TTile[];
  pairsFound: number;
  allPairsAllowed: boolean;
}

function splitIntoSets(options: ISplitSetsOptions): ISet[][] {
  const { hand, pairsFound, allPairsAllowed } = options;

  const firstTile = hand.at(0);

  if (!firstTile) {
    return [];
  }

  const sets: ISet[][] = [];

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
            concealed: true,
          },
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
            concealed: true,
          },
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
                tiles: [firstTile, hand[higherBy1TileIndex], hand[higherBy2TileIndex]],
                concealed: true,
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
                concealed: true,
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
