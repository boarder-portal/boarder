import { PLAYER_SETTINGS } from 'common/constants/games/common';

import { EGame, TPlayerSettings } from 'common/types/game';

import useLocalStorageAtom from 'client/hooks/useLocalStorageAtom';
import useImmutableCallback from 'client/hooks/useImmutableCallback';

import { playerSettingsAtoms } from 'client/atoms/playerSettingsAtoms';

export interface IUsePlayerSettings<Game extends EGame> {
  settings: TPlayerSettings<Game>;
  changeSetting<Key extends keyof TPlayerSettings<Game>>(key: Key, value: TPlayerSettings<Game>[Key]): void;
  reset(): void;
}

export default function usePlayerSettings<Game extends EGame>(game: Game): IUsePlayerSettings<Game> {
  const [settings, changeSettings] = useLocalStorageAtom(playerSettingsAtoms[game]);

  return {
    settings,
    changeSetting: useImmutableCallback((key, value) => {
      changeSettings({
        ...settings,
        [key]: value,
      });
    }),
    reset: useImmutableCallback(() => {
      changeSettings(PLAYER_SETTINGS[game]);
    }),
  };
}
