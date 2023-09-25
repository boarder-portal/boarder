import {
  FLOWERS_STRING_VALUES,
  STRING_TO_DRAGON_MAP,
  STRING_TO_SUIT_MAP,
  STRING_TO_WIND_MAP,
  SUITED_STRING_VALUES,
} from 'common/constants/games/mahjong';

import {
  ChowSet,
  KongSet,
  MeldedSet,
  PlayableTile,
  PungSet,
  SetConcealedType,
  SetType,
  Tile,
  TileType,
} from 'common/types/games/mahjong';

import { isPlayable } from 'common/utilities/games/mahjong/tiles';
import { chow, dragon, flower, isSuited, kong, pung, suited, wind } from 'common/utilities/games/mahjong/tilesBase';

export function parseTiles(tilesString: string): Tile[] {
  return tilesString.replace(/\s/g, '').match(/../g)?.map(parseTile) ?? [];
}

export function parsePlayableTiles(tilesString: string): PlayableTile[] {
  return parseTiles(tilesString).filter(isPlayable);
}

export function parsePlayableTileSets(tilesString: string): PlayableTile[][] {
  return tilesString.split(' ').map((tilesString) => parseTiles(tilesString).filter(isPlayable));
}

export function parseTile(tileString: string): Tile {
  if (tileString.length !== 2) {
    throw new Error(`Wrong length, expected 2, got ${tileString.length}`);
  }

  const [first, second] = tileString;

  if (first === 'f') {
    const value = FLOWERS_STRING_VALUES.indexOf(second);

    if (value === -1) {
      throw new Error(`Wrong flower value, expected 1-8, got ${second}`);
    }

    return flower(value);
  }

  if (first === 'D') {
    const color = STRING_TO_DRAGON_MAP[second];

    if (!color) {
      throw new Error(`Unexpected dragon value, expected one of "r", "g", "w", got "${second}"`);
    }

    return dragon(color);
  }

  if (first === 'W') {
    const side = STRING_TO_WIND_MAP[second];

    if (!side) {
      throw new Error(`Unexpected wind value, expected one of "e", "s", "w", "n", got "${second}"`);
    }

    return wind(side);
  }

  const suit = STRING_TO_SUIT_MAP[first];

  if (!suit) {
    throw new Error(`Unexpected suit value, expected one of "b", "c", "d", got ${first}`);
  }

  const value = SUITED_STRING_VALUES.indexOf(second) + 1;

  if (!value) {
    throw new Error(`Wrong tile value, expected 1-9, got ${second}`);
  }

  return suited(value, suit);
}

export function parsePlayableTile(tileString: string): PlayableTile {
  const tile = parseTile(tileString);

  if (!isPlayable(tile)) {
    throw new Error(`Wrong tile ${tileString}`);
  }

  return tile;
}

export function parsePung(tileString: string): MeldedSet<PungSet> {
  return {
    type: SetType.PUNG,
    tiles: pung(parsePlayableTile(tileString)),
    concealedType: SetConcealedType.MELDED,
  };
}

export function parseKong<ConcealedType extends SetConcealedType>(
  tileString: string,
  concealedType: ConcealedType,
): KongSet & { concealedType: ConcealedType } {
  return {
    type: SetType.KONG,
    tiles: kong(parsePlayableTile(tileString)),
    concealedType,
  };
}

export function parseChow(tileString: string): MeldedSet<ChowSet> {
  const chowTile = parsePlayableTile(tileString);

  if (!isSuited(chowTile) || chowTile.value === 1 || chowTile.value === 9) {
    throw new Error(`Wrong chow tile ${tileString}`);
  }

  return {
    type: SetType.CHOW,
    tiles: chow(chowTile),
    concealedType: SetConcealedType.MELDED,
  };
}
