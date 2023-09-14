import { useContext } from 'react';

import { GameType } from 'common/types/game';

import { PlayerSettingsContext, PlayerSettingsContexts } from 'client/pages/Game/contexts';

export default function usePlayerSettings<Game extends GameType>(game: Game): PlayerSettingsContext<Game> {
  return useContext(PlayerSettingsContexts[game]);
}
