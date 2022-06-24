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
