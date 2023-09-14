import { PLAYER_SETTINGS } from 'common/constants/game';

import { GameType, PlayerSettings } from 'common/types/game';

import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useLocalStorageAtom from 'client/hooks/useLocalStorageAtom';

import { playerSettingsAtoms } from 'client/atoms/playerSettingsAtoms';

export interface UseLocalPlayerSettings<Game extends GameType> {
  settings: PlayerSettings<Game>;
  changeSetting<Key extends keyof PlayerSettings<Game>>(key: Key, value: PlayerSettings<Game>[Key]): void;
  reset(): void;
}

export default function useLocalPlayerSettings<Game extends GameType>(game: Game): UseLocalPlayerSettings<Game> {
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
