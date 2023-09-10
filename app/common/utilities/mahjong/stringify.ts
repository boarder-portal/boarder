import {
  DRAGON_TO_STRING_MAP,
  FLOWERS_STRING_VALUES,
  SET_NAMES as HUMAN_SET_NAMES,
  SUITED_STRING_VALUES,
  SUIT_TO_STRING_MAP,
  WIND_NAMES,
  WIND_SHORT_NAMES,
  WIND_TO_STRING_MAP,
} from 'common/constants/games/mahjong';

import { Fan, HandMahjong, Set, SetConcealedType, SetType, Tile, TileType, WindSide } from 'common/types/mahjong';

import { isSetsFan, isSpecialFan } from 'common/utilities/mahjong/fans';
import { getSetTile } from 'common/utilities/mahjong/sets';

const SET_NAMES: Record<SetType, string> = {
  [SetType.PAIR]: 'pair',
  [SetType.PUNG]: 'pung',
  [SetType.KONG]: 'kong',
  [SetType.CHOW]: 'chow',
  [SetType.KNITTED_CHOW]: 'knit',
};

export function stringifyTile(tile: Tile): string {
  if (tile.type === TileType.FLOWER) {
    return `f${FLOWERS_STRING_VALUES[tile.index]}`;
  }

  if (tile.type === TileType.DRAGON) {
    return `D${DRAGON_TO_STRING_MAP[tile.color]}`;
  }

  if (tile.type === TileType.WIND) {
    return `W${WIND_TO_STRING_MAP[tile.side]}`;
  }

  return `${SUIT_TO_STRING_MAP[tile.suit]}${SUITED_STRING_VALUES[tile.value - 1]}`;
}

export function stringifySet(set: Set): string {
  return `${set.concealedType === SetConcealedType.CONCEALED ? 'c' : 'm'}_${SET_NAMES[set.type]} ${stringifyTile(
    getSetTile(set),
  )}`;
}

export function stringifyFan(fan: Fan): string {
  if (isSetsFan(fan)) {
    return `${fan.fan} (${fan.sets.map(stringifySet).join(', ')})`;
  }

  if (isSpecialFan(fan)) {
    return `${fan.fan}${fan.tile ? ` (${stringifyTile(fan.tile)})` : ''}`;
  }

  return fan.fan;
}

export function stringifyMahjong(mahjong: HandMahjong | null): string {
  if (!mahjong) {
    return 'null';
  }

  return `${mahjong.score}

${mahjong.waits.map(stringifyTile).join(' ')}

${mahjong.fans.map(stringifyFan).join('\n')}${mahjong.sets ? `\n\n${mahjong.sets.map(stringifySet).join('\n')}` : ''}`;
}

export function getSetNumanName(set: Set): string {
  return HUMAN_SET_NAMES[set.type];
}

export function getWindHumanName(wind: WindSide): string {
  return WIND_NAMES[wind];
}

export function getWindHumanShortName(wind: WindSide): string {
  return WIND_SHORT_NAMES[wind];
}
