import { ALL_DRAGONS, ALL_SUITS, ALL_WINDS } from 'common/constants/games/mahjong';

import {
  EDragon,
  ESuit,
  ETileType,
  EWind,
  IDragonTile,
  IFlowerTile,
  ISuitedTile,
  IWindTile,
  TTile,
} from 'common/types/mahjong';

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

export function isHonor(tile: TTile): boolean {
  return isDragon(tile) || isWind(tile);
}

export function isTerminal(tile: TTile): boolean {
  return isSuited(tile) && (tile.value === 1 || tile.value === 9);
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

export function isTileSubset(tiles: TTile[], tilesSet: TTile[]): boolean {
  return tiles.every((tile) => tilesContainTile(tilesSet, tile));
}

export function getTileSortValue(tile: TTile): number {
  if (isFlower(tile)) {
    return 10000 + tile.index;
  }

  if (isDragon(tile)) {
    return 1000 + ALL_DRAGONS.indexOf(tile.color);
  }

  if (isWind(tile)) {
    return 100 + ALL_WINDS.indexOf(tile.side);
  }

  return 10 * ALL_SUITS.indexOf(tile.suit) + tile.value;
}
