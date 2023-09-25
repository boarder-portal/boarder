import {
  DragonColor,
  DragonTile,
  FlowerTile,
  Suit,
  SuitedTile,
  Tile,
  TileType,
  WindSide,
  WindTile,
} from 'common/types/games/mahjong';

export function suited(value: number, suit: Suit): SuitedTile {
  return {
    type: TileType.SUIT,
    suit,
    value,
  };
}

export function dragon(color: DragonColor): DragonTile {
  return {
    type: TileType.DRAGON,
    color,
  };
}

export function wind(side: WindSide): WindTile {
  return {
    type: TileType.WIND,
    side,
  };
}

export function flower(index: number): FlowerTile {
  return {
    type: TileType.FLOWER,
    index,
  };
}

export function pair<T extends Tile>(tile: T): T[] {
  return [tile, tile];
}

export function pung<T extends Tile>(tile: T): T[] {
  return [tile, tile, tile];
}

export function kong<T extends Tile>(tile: T): T[] {
  return [tile, tile, tile, tile];
}

export function chow(tile: SuitedTile): SuitedTile[] {
  return [suited(tile.value - 1, tile.suit), tile, suited(tile.value + 1, tile.suit)];
}

export function isSuited(tile: Tile): tile is SuitedTile {
  return tile.type === TileType.SUIT;
}

export function isDragon(tile: Tile): tile is DragonTile {
  return tile.type === TileType.DRAGON;
}

export function isWind(tile: Tile): tile is WindTile {
  return tile.type === TileType.WIND;
}

export function isFlower(tile: Tile): tile is FlowerTile {
  return tile.type === TileType.FLOWER;
}
