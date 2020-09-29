import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IPexesoGameOptions } from 'common/types/pexeso';
import { EGame } from 'common/types';

const {
  games: {
    [EGame.PEXESO]: {
      sets,
    },
  },
} = GAMES_CONFIG;

export function arePexesoOptionsValid(options: IPexesoGameOptions): boolean {
  const setOptions = sets[options.set];

  return (
    options.differentCardsCount <= setOptions.imagesCount
    && (!options.useImageVariants || options.matchingCardsCount <= setOptions.imageVariantsCount)
  );
}
