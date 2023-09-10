import { ALL_DRAGONS, ALL_SUITS, ALL_WINDS } from 'common/constants/games/mahjong';
import { STANDARD_TILES } from 'common/constants/games/mahjong/tiles';

import {
  EDragon,
  ESuit,
  ETileType,
  EWind,
  IDragonTile,
  IFlowerTile,
  IHandPlayerData,
  ISuitedTile,
  IWindTile,
  TPlayableTile,
  TTile,
} from 'common/types/mahjong';

import { isDeclaredMeldedSet } from 'common/utilities/mahjong/sets';

export function suited(value: number, suit: ESuit): ISuitedTile {
  return {
    type: ETileType.SUIT,
    suit,
    value,
  };
}

export function dragon(color: EDragon): IDragonTile {
  return {
    type: ETileType.DRAGON,
    color,
  };
}

export function wind(side: EWind): IWindTile {
  return {
    type: ETileType.WIND,
    side,
  };
}

export function flower(index: number): IFlowerTile {
  return {
    type: ETileType.FLOWER,
    index,
  };
}

export function pair<Tile extends TTile>(tile: Tile): Tile[] {
  return [tile, tile];
}

export function pung<Tile extends TTile>(tile: Tile): Tile[] {
  return [tile, tile, tile];
}

export function kong<Tile extends TTile>(tile: Tile): Tile[] {
  return [tile, tile, tile, tile];
}

export function chow(tile: ISuitedTile): ISuitedTile[] {
  return [suited(tile.value - 1, tile.suit), tile, suited(tile.value + 1, tile.suit)];
}

export function isSuited(tile: TTile): tile is ISuitedTile {
  return tile.type === ETileType.SUIT;
}

export function isDragon(tile: TTile): tile is IDragonTile {
  return tile.type === ETileType.DRAGON;
}

export function isWind(tile: TTile): tile is IWindTile {
  return tile.type === ETileType.WIND;
}

export function isFlower(tile: TTile): tile is IFlowerTile {
  return tile.type === ETileType.FLOWER;
}

export function isPlayable(tile: TTile): tile is TPlayableTile {
  return !isFlower(tile);
}

export function isHonor(tile: TTile): boolean {
  return isDragon(tile) || isWind(tile);
}

export function isTerminal(tile: TTile): boolean {
  return isSuited(tile) && (tile.value === 1 || tile.value === 9);
}

export function isTerminalOrHonor(tile: TTile): boolean {
  return isTerminal(tile) || isHonor(tile);
}

export function isEqualTiles(tile1: TTile, tile2: TTile | null | undefined): boolean {
  if (tile1.type !== tile2?.type) {
    return false;
  }

  if (tile1.type === ETileType.SUIT && tile2.type === ETileType.SUIT) {
    return tile1.suit === tile2.suit && tile1.value === tile2.value;
  }

  if (tile1.type === ETileType.DRAGON && tile2.type === ETileType.DRAGON) {
    return tile1.color === tile2.color;
  }

  if (tile1.type === ETileType.WIND && tile2.type === ETileType.WIND) {
    return tile1.side === tile2.side;
  }

  if (tile1.type === ETileType.FLOWER && tile2.type === ETileType.FLOWER) {
    return tile1.index === tile2.index;
  }

  return false;
}

export function isEqualTilesCallback(tile1: TTile): (tile2: TTile | null | undefined) => boolean {
  return (tile2) => isEqualTiles(tile1, tile2);
}

export function tilesContainTile(tiles: TTile[], tile: TTile): boolean {
  return tiles.some(isEqualTilesCallback(tile));
}

export function getTileCount(tiles: TTile[], tile: TTile): number {
  return tiles.filter(isEqualTilesCallback(tile)).length;
}

export function isTileSubset(tiles: TTile[], tilesSet: TTile[]): boolean {
  return tiles.every((tile) => tilesContainTile(tilesSet, tile));
}

export function isFlush(tiles: TTile[]): tiles is ISuitedTile[] {
  if (!areSuited(tiles)) {
    return false;
  }

  return getSuitsCount(tiles) === 1;
}

export function isStraight(tiles: TTile[], possibleShifts = [1]): tiles is ISuitedTile[] {
  if (!areSuited(tiles)) {
    return false;
  }

  const sortedValues = getSortedValues(tiles);

  return possibleShifts.some((shift) =>
    sortedValues.every((value, index, array) => index === 0 || array[index - 1] === value - shift),
  );
}

export function areSuited(tiles: TTile[]): tiles is ISuitedTile[] {
  return tiles.every(isSuited);
}

export function areSameValues(tiles: ISuitedTile[]): boolean {
  return tiles.every((tile) => tile.value === tiles.at(0)?.value);
}

export function getSuitsCount(tiles: TTile[]): number {
  return tiles.reduce((suits, tile) => {
    if (isSuited(tile)) {
      suits.add(tile.suit);
    }

    return suits;
  }, new Set<ESuit>()).size;
}

export function getSortedValues(tiles: ISuitedTile[]): number[] {
  return tiles.map(({ value }) => value).sort();
}

export function getSortedValuesString(tiles: ISuitedTile[]): string {
  return getSortedValues(tiles).join('');
}

export function getTileSortValue(tile: TTile): number {
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

export function getLastTileCandidates(playersData: (IHandPlayerData | null)[], isSelfDraw: boolean): TTile[] {
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

export function getLastTileCandidatesFromTiles(tiles: TTile[], isSelfDraw: boolean): TTile[] {
  const threshold = isSelfDraw ? 3 : 4;

  return STANDARD_TILES.filter((tile) => {
    return getTileCount(tiles, tile) >= threshold;
  });
}
