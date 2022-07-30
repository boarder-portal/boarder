import { useState } from 'react';

import { EGame, TGameOptions } from 'common/types/game';

import useLocalStorageAtom from 'client/hooks/useLocalStorageAtom';
import useImmutableCallback from 'client/hooks/useImmutableCallback';

import { gameOptionsAtoms } from 'client/atoms/gameOptionsAtoms';

export interface IUseGameOptions<Game extends EGame> {
  options: TGameOptions<Game>;
  setOptions(options: TGameOptions<Game> | ((options: TGameOptions<Game>) => TGameOptions<Game>)): void;
  refreshDefaultOptions(): void;
}

export default function useGameOptions<Game extends EGame>(game: Game): IUseGameOptions<Game> {
  const [defaultOptions, setDefaultOptions] = useLocalStorageAtom(gameOptionsAtoms[game]);
  const [options, setOptions] = useState<TGameOptions<Game>>(defaultOptions);

  return {
    options,
    setOptions,
    refreshDefaultOptions: useImmutableCallback(() => setDefaultOptions(options, { refreshDefault: true })),
  };
}
