import { useState } from 'react';

import { GameOptions, GameType } from 'common/types/game';

import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useLocalStorageAtom from 'client/hooks/useLocalStorageAtom';

import { gameOptionsAtoms } from 'client/atoms/gameOptionsAtoms';

export interface UseGameOptions<Game extends GameType> {
  options: GameOptions<Game>;
  setOptions(options: GameOptions<Game> | ((options: GameOptions<Game>) => GameOptions<Game>)): void;
  refreshDefaultOptions(): void;
}

export default function useGameOptions<Game extends GameType>(game: Game): UseGameOptions<Game> {
  const [defaultOptions, setDefaultOptions] = useLocalStorageAtom(gameOptionsAtoms[game]);
  const [options, setOptions] = useState<GameOptions<Game>>(defaultOptions);

  return {
    options,
    setOptions,
    refreshDefaultOptions: useImmutableCallback(() => setDefaultOptions(options, { refreshDefault: true })),
  };
}
