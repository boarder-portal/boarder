import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';

import { PLAYER_SETTINGS } from 'common/constants/games/common';

import { GameType } from 'common/types/game';

import LocalStorageAtom, { PLAYER_SETTINGS_KEYS } from 'client/utilities/LocalStorageAtom';

export const playerSettingsAtoms = mapValues(mapKeys(GameType), (game) => {
  return new LocalStorageAtom(PLAYER_SETTINGS_KEYS[game], PLAYER_SETTINGS[game]);
});
