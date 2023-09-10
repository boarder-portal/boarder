import { ALL_DRAGONS, ALL_SUITS, ALL_WINDS } from 'common/constants/games/mahjong';
import { STANDARD_TILES } from 'common/constants/games/mahjong/tiles';

import { HandPlayerData, PlayableTile, Suit, SuitedTile, Tile, TileType } from 'common/types/games/mahjong';

import { isDeclaredMeldedSet } from 'common/utilities/mahjong/sets';
import { isDragon, isFlower, isSuited, isWind } from 'common/utilities/mahjong/tilesBase';

export function isPlayable(tile: Tile): tile is PlayableTile {
  return !isFlower(tile);
}

export function isHonor(tile: Tile): boolean {
  return isDragon(tile) || isWind(tile);
}

export function isTerminal(tile: Tile): boolean {
  return isSuited(tile) && (tile.value === 1 || tile.value === 9);
}

export function isTerminalOrHonor(tile: Tile): boolean {
  return isTerminal(tile) || isHonor(tile);
}

export function isEqualTiles(tile1: Tile, tile2: Tile | null | undefined): boolean {
  if (tile1.type !== tile2?.type) {
    return false;
  }

  if (tile1.type === TileType.SUIT && tile2.type === TileType.SUIT) {
    return tile1.suit === tile2.suit && tile1.value === tile2.value;
  }

  if (tile1.type === TileType.DRAGON && tile2.type === TileType.DRAGON) {
    return tile1.color === tile2.color;
  }

  if (tile1.type === TileType.WIND && tile2.type === TileType.WIND) {
    return tile1.side === tile2.side;
  }

  if (tile1.type === TileType.FLOWER && tile2.type === TileType.FLOWER) {
    return tile1.index === tile2.index;
  }

  return false;
}

export function isEqualTilesCallback(tile1: Tile): (tile2: Tile | null | undefined) => boolean {
  return (tile2) => isEqualTiles(tile1, tile2);
}

export function tilesContainTile(tiles: Tile[], tile: Tile): boolean {
  return tiles.some(isEqualTilesCallback(tile));
}

export function getTileCount(tiles: Tile[], tile: Tile): number {
  return tiles.filter(isEqualTilesCallback(tile)).length;
}

export function isTileSubset(tiles: Tile[], tilesSet: Tile[]): boolean {
  return tiles.every((tile) => tilesContainTile(tilesSet, tile));
}

export function isFlush(tiles: Tile[]): tiles is SuitedTile[] {
  if (!areSuited(tiles)) {
    return false;
  }

  return getSuitsCount(tiles) === 1;
}

export function isStraight(tiles: Tile[], possibleShifts = [1]): tiles is SuitedTile[] {
  if (!areSuited(tiles)) {
    return false;
  }

  const sortedValues = getSortedValues(tiles);

  return possibleShifts.some((shift) =>
    sortedValues.every((value, index, array) => index === 0 || array[index - 1] === value - shift),
  );
}

export function areSuited(tiles: Tile[]): tiles is SuitedTile[] {
  return tiles.every(isSuited);
}

export function areSameValues(tiles: SuitedTile[]): boolean {
  return tiles.every((tile) => tile.value === tiles.at(0)?.value);
}

export function getSuitsCount(tiles: Tile[]): number {
  return tiles.reduce((suits, tile) => {
    if (isSuited(tile)) {
      suits.add(tile.suit);
    }

    return suits;
  }, new Set<Suit>()).size;
}

export function getSortedValues(tiles: SuitedTile[]): number[] {
  return tiles.map(({ value }) => value).sort();
}

export function getSortedValuesString(tiles: SuitedTile[]): string {
  return getSortedValues(tiles).join('');
}

export function getTileSortValue(tile: Tile): number {
  if (isFlower(tile)) {
    return 300 + tile.index;
  }

  if (isDragon(tile)) {
    return 200 + ALL_DRAGONS.indexOf(tile.color);
  }

  if (isWind(tile)) {
    return 100 + ALL_WINDS.indexOf(tile.side);
  }

  return 10 * ALL_SUITS.indexOf(tile.suit) + tile.value;
}

export function getSupposedHandTileCount(setsCount: number): number {
  return 13 - 3 * setsCount;
}

export function getNewCurrentTileIndex(currentTileIndex: number, from: number, to: number): number {
  if (currentTileIndex === from) {
    return to;
  }

  if (currentTileIndex < from) {
    return to <= currentTileIndex ? currentTileIndex + 1 : currentTileIndex;
  }

  return to >= currentTileIndex ? currentTileIndex - 1 : currentTileIndex;
}

export function getLastTileCandidates(playersData: (HandPlayerData | null)[], isSelfDraw: boolean): Tile[] {
  const allTiles = [
    ...playersData.flatMap((playerData) => {
      if (!playerData) {
        return [];
      }

      return [
        ...playerData.discard,
        ...playerData.declaredSets.filter(isDeclaredMeldedSet).flatMap(({ set }) => set.tiles),
      ];
    }),
  ];

  return getLastTileCandidatesFromTiles(allTiles, isSelfDraw);
}

export function getLastTileCandidatesFromTiles(tiles: Tile[], isSelfDraw: boolean): Tile[] {
  const threshold = isSelfDraw ? 3 : 4;

  return STANDARD_TILES.filter((tile) => {
    return getTileCount(tiles, tile) >= threshold;
  });
}
