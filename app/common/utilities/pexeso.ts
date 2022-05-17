import { FIELD_OPTIONS, SETS } from 'common/constants/games/pexeso';

import { EFieldLayout, IGameOptions } from 'common/types/pexeso';

export function arePexesoOptionsValid(options: IGameOptions): boolean {
  const setOptions = SETS[options.set];
  const cardsCount = options.differentCardsCount * options.matchingCardsCount;

  return (
    options.differentCardsCount <= setOptions.imagesCount &&
    (!options.useImageVariants || options.matchingCardsCount <= setOptions.imageVariantsCount) &&
    (options.layout === EFieldLayout.SPIRAL || options.layout === EFieldLayout.SPIRAL_ROTATE
      ? true
      : cardsCount in FIELD_OPTIONS[options.layout] && cardsCount < 200)
  );
}
