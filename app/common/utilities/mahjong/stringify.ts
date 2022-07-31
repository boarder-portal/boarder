import {
  DRAGON_TO_STRING_MAP,
  FLOWERS_STRING_VALUES,
  SUIT_TO_STRING_MAP,
  SUITED_STRING_VALUES,
  WIND_TO_STRING_MAP,
  SET_NAMES as HUMAN_SET_NAMES,
  WIND_SHORT_NAMES,
} from 'common/constants/games/mahjong';

import { ESet, ESetConcealedType, ETileType, EWind, IHandMahjong, TFan, TSet, TTile } from 'common/types/mahjong';

import { isSetsFan, isSpecialFan } from 'common/utilities/mahjong/fans';
import { getSetTile } from 'common/utilities/mahjong/sets';

const SET_NAMES: Record<ESet, string> = {
  [ESet.PAIR]: 'pair',
  [ESet.PUNG]: 'pung',
  [ESet.KONG]: 'kong',
  [ESet.CHOW]: 'chow',
  [ESet.KNITTED_CHOW]: 'knit',
};

export function stringifyTile(tile: TTile): string {
  if (tile.type === ETileType.FLOWER) {
    return `f${FLOWERS_STRING_VALUES[tile.index]}`;
  }

  if (tile.type === ETileType.DRAGON) {
    return `D${DRAGON_TO_STRING_MAP[tile.color]}`;
  }

  if (tile.type === ETileType.WIND) {
    return `W${WIND_TO_STRING_MAP[tile.side]}`;
  }

  return `${SUIT_TO_STRING_MAP[tile.suit]}${SUITED_STRING_VALUES[tile.value - 1]}`;
}

export function stringifySet(set: TSet): string {
  return `${set.concealedType === ESetConcealedType.CONCEALED ? 'c' : 'm'}_${SET_NAMES[set.type]} ${stringifyTile(
    getSetTile(set),
  )}`;
}

export function stringifyFan(fan: TFan): string {
  if (isSetsFan(fan)) {
    return `${fan.fan} (${fan.sets.map(stringifySet).join(', ')})`;
  }

  if (isSpecialFan(fan)) {
    return `${fan.fan}${fan.tile ? ` (${stringifyTile(fan.tile)})` : ''}`;
  }

  return fan.fan;
}

export function stringifyMahjong(mahjong: IHandMahjong | null): string {
  if (!mahjong) {
    return 'null';
  }

  return `${mahjong.score}

${mahjong.waits.map(stringifyTile).join(' ')}

${mahjong.fans.map(stringifyFan).join('\n')}${mahjong.sets ? `\n\n${mahjong.sets.map(stringifySet).join('\n')}` : ''}`;
}

export function getSetNumanName(set: TSet): string {
  return HUMAN_SET_NAMES[set.type];
}

export function getWindHumanShortName(wind: EWind): string {
  return WIND_SHORT_NAMES[wind];
}
