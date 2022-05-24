import { mapKeys, mapValues } from 'lodash';

import { DEFAULT_GAME_OPTIONS as PEXESO_OPTIONS } from 'common/constants/games/pexeso';
import { DEFAULT_GAME_OPTIONS as SURVIVAL_ONLINE_OPTIONS } from 'common/constants/games/survivalOnline';
import { DEFAULT_GAME_OPTIONS as SET_OPTIONS } from 'common/constants/games/set';
import { DEFAULT_GAME_OPTIONS as ONITAMA_OPTIONS } from 'common/constants/games/onitama';
import { DEFAULT_GAME_OPTIONS as CARCASSONNE_OPTIONS } from 'common/constants/games/carcassonne';
import { DEFAULT_GAME_OPTIONS as SEVEN_WONDERS_OPTIONS } from 'common/constants/games/sevenWonders';
import { DEFAULT_GAME_OPTIONS as HEARTS_OPTIONS } from 'common/constants/games/hearts';

import { EGame, TGameOptions } from 'common/types/game';

import LocalStorageAtom, { EGameDefaultOptionsKey } from 'client/utilities/LocalStorageAtom';

const DEFAULT_OPTIONS: {
  [Game in EGame]: TGameOptions<Game>;
} = {
  [EGame.PEXESO]: PEXESO_OPTIONS,
  [EGame.SURVIVAL_ONLINE]: SURVIVAL_ONLINE_OPTIONS,
  [EGame.SET]: SET_OPTIONS,
  [EGame.ONITAMA]: ONITAMA_OPTIONS,
  [EGame.CARCASSONNE]: CARCASSONNE_OPTIONS,
  [EGame.SEVEN_WONDERS]: SEVEN_WONDERS_OPTIONS,
  [EGame.HEARTS]: HEARTS_OPTIONS,
};

export const gameOptionsAtoms = mapValues(mapKeys(EGame), (game) => {
  return new LocalStorageAtom(`game/${game}/defaultOptions`, DEFAULT_OPTIONS[game]);
}) as {
  [Game in EGame]: LocalStorageAtom<EGameDefaultOptionsKey<Game>>;
};
