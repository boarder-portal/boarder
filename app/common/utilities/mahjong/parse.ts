import {
  FLOWERS_STRING_VALUES,
  STRING_TO_DRAGON_MAP,
  STRING_TO_SUIT_MAP,
  STRING_TO_WIND_MAP,
  SUITED_STRING_VALUES,
} from 'common/constants/games/mahjong';

import { ESet, ESetConcealedType, ETileType, IChowSet, IKongSet, IPungSet, TTile } from 'common/types/mahjong';

import { isSuited, suited } from 'common/utilities/mahjong/tiles';

export function parseTiles(tilesString: string): TTile[] {
  return tilesString.replace(/\s/g, '').match(/../g)?.map(parseTile) ?? [];
}

export function parseTile(tileString: string): TTile {
  if (tileString.length !== 2) {
    throw new Error(`Wrong length, expected 2, got ${tileString.length}`);
  }

  const [first, second] = tileString;

  if (first === 'f') {
    const value = FLOWERS_STRING_VALUES.indexOf(second);

    if (value === -1) {
      throw new Error(`Wrong flower value, expected 1-8, got ${second}`);
    }

    return {
      type: ETileType.FLOWER,
      index: value,
    };
  }

  if (first === 'D') {
    const dragon = STRING_TO_DRAGON_MAP[second];

    if (!dragon) {
      throw new Error(`Unexpected dragon value, expected one of "r", "g", "w", got "${second}"`);
    }

    return {
      type: ETileType.DRAGON,
      color: dragon,
    };
  }

  if (first === 'W') {
    const wind = STRING_TO_WIND_MAP[second];

    if (!wind) {
      throw new Error(`Unexpected wind value, expected one of "e", "s", "w", "n", got "${second}"`);
    }

    return {
      type: ETileType.WIND,
      side: wind,
    };
  }

  const suit = STRING_TO_SUIT_MAP[first];

  if (!suit) {
    throw new Error(`Unexpected suit value, expected one of "b", "c", "d", got ${first}`);
  }

  const value = SUITED_STRING_VALUES.indexOf(second) + 1;

  if (!value) {
    throw new Error(`Wrong tile value, expected 1-9, got ${second}`);
  }

  return {
    type: ETileType.SUIT,
    suit,
    value,
  };
}

export function parsePung<ConcealedType extends ESetConcealedType>(
  pungTileString: string,
  concealedType: ConcealedType,
): IPungSet & { concealedType: ConcealedType } {
  return {
    type: ESet.PUNG,
    tiles: parseTiles(pungTileString.repeat(3)),
    concealedType,
  };
}

export function parseKong<ConcealedType extends ESetConcealedType>(
  kongTileString: string,
  concealedType: ConcealedType,
): IKongSet & { concealedType: ConcealedType } {
  return {
    type: ESet.KONG,
    tiles: parseTiles(kongTileString.repeat(4)),
    concealedType,
  };
}

export function parseChow<ConcealedType extends ESetConcealedType>(
  chowTileString: string,
  concealedType: ConcealedType,
): IChowSet & { concealedType: ConcealedType } {
  const chowTile = parseTile(chowTileString);

  if (!isSuited(chowTile) || chowTile.value === 1 || chowTile.value === 9) {
    throw new Error(`Wrong chow tile ${chowTileString}`);
  }

  return {
    type: ESet.CHOW,
    tiles: [suited(chowTile.value - 1, chowTile.suit), chowTile, suited(chowTile.value + 1, chowTile.suit)],
    concealedType,
  };
}
