import { useContext } from 'react';

import { GameType, PlayerSettings } from 'common/types/game';

import { PlayerSettingsContexts } from 'client/pages/Game/contexts';

export default function usePlayerSettings<Game extends GameType>(game: Game): PlayerSettings<Game> {
  return useContext(PlayerSettingsContexts[game]);
}
