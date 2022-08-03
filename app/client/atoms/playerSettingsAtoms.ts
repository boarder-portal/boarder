import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';

import { PLAYER_SETTINGS } from 'common/constants/games/common';

import { EGame } from 'common/types/game';

import LocalStorageAtom, { PLAYER_SETTINGS_KEYS } from 'client/utilities/LocalStorageAtom';

export const playerSettingsAtoms = mapValues(mapKeys(EGame), (game) => {
  return new LocalStorageAtom(PLAYER_SETTINGS_KEYS[game], PLAYER_SETTINGS[game]);
});
