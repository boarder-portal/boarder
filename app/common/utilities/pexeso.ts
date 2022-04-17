import { FIELD_OPTIONS, SETS } from 'common/constants/games/pexeso';

import { EPexesoFieldLayout, IPexesoGameOptions } from 'common/types/pexeso';

export function arePexesoOptionsValid(options: IPexesoGameOptions): boolean {
  const setOptions = SETS[options.set];
  const cardsCount = options.differentCardsCount * options.matchingCardsCount;

  return (
    options.differentCardsCount <= setOptions.imagesCount
    && (!options.useImageVariants || options.matchingCardsCount <= setOptions.imageVariantsCount)
    && (
      options.layout === EPexesoFieldLayout.SPIRAL || options.layout === EPexesoFieldLayout.SPIRAL_ROTATE
        ? true
        : cardsCount in FIELD_OPTIONS[options.layout] && cardsCount < 200
    )
  );
}
