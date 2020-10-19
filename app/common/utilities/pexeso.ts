import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EPexesoFieldLayout, IPexesoGameOptions } from 'common/types/pexeso';
import { EGame } from 'common/types';

const {
  games: {
    [EGame.PEXESO]: {
      sets,
      fieldOptions,
    },
  },
} = GAMES_CONFIG;

export function arePexesoOptionsValid(options: IPexesoGameOptions): boolean {
  const setOptions = sets[options.set];
  const cardsCount = options.differentCardsCount * options.matchingCardsCount;

  return (
    options.differentCardsCount <= setOptions.imagesCount
    && (!options.useImageVariants || options.matchingCardsCount <= setOptions.imageVariantsCount)
    && (
      options.layout === EPexesoFieldLayout.SPIRAL || options.layout === EPexesoFieldLayout.SPIRAL_ROTATE
        ? true
        : cardsCount in fieldOptions[options.layout] && cardsCount < 200
    )
  );
}
