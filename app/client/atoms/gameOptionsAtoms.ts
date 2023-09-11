import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';

import { DEFAULT_GAME_OPTIONS as BOMBERS_OPTIONS } from 'common/constants/games/bombers';
import { DEFAULT_GAME_OPTIONS as CARCASSONNE_OPTIONS } from 'common/constants/games/carcassonne';
import { DEFAULT_GAME_OPTIONS as HEARTS_OPTIONS } from 'common/constants/games/hearts';
import { DEFAULT_GAME_OPTIONS as MACHI_KORO_OPTIONS } from 'common/constants/games/machiKoro';
import { DEFAULT_GAME_OPTIONS as MAHJONG_OPTIONS } from 'common/constants/games/mahjong';
import { DEFAULT_GAME_OPTIONS as ONITAMA_OPTIONS } from 'common/constants/games/onitama';
import { DEFAULT_GAME_OPTIONS as PEXESO_OPTIONS } from 'common/constants/games/pexeso';
import { DEFAULT_GAME_OPTIONS as RED_SEVEN_OPTIONS } from 'common/constants/games/redSeven';
import { DEFAULT_GAME_OPTIONS as SET_OPTIONS } from 'common/constants/games/set';
import { DEFAULT_GAME_OPTIONS as SEVEN_WONDERS_OPTIONS } from 'common/constants/games/sevenWonders';
import { DEFAULT_GAME_OPTIONS as SURVIVAL_ONLINE_OPTIONS } from 'common/constants/games/survivalOnline';

import { GameOptions, GameType } from 'common/types/game';

import LocalStorageAtom, { GAME_OPTIONS_KEYS } from 'client/utilities/LocalStorageAtom';

export const DEFAULT_OPTIONS: {
  [Game in GameType]: GameOptions<Game>;
} = {
  [GameType.PEXESO]: PEXESO_OPTIONS,
  [GameType.SURVIVAL_ONLINE]: SURVIVAL_ONLINE_OPTIONS,
  [GameType.SET]: SET_OPTIONS,
  [GameType.ONITAMA]: ONITAMA_OPTIONS,
  [GameType.CARCASSONNE]: CARCASSONNE_OPTIONS,
  [GameType.SEVEN_WONDERS]: SEVEN_WONDERS_OPTIONS,
  [GameType.HEARTS]: HEARTS_OPTIONS,
  [GameType.BOMBERS]: BOMBERS_OPTIONS,
  [GameType.MACHI_KORO]: MACHI_KORO_OPTIONS,
  [GameType.MAHJONG]: MAHJONG_OPTIONS,
  [GameType.RED_SEVEN]: RED_SEVEN_OPTIONS,
};

export const gameOptionsAtoms = mapValues(mapKeys(GameType), (game) => {
  return new LocalStorageAtom(GAME_OPTIONS_KEYS[game], DEFAULT_OPTIONS[game]);
});
