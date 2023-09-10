import { FIELD_OPTIONS, SETS } from 'common/constants/games/pexeso';

import { FieldLayoutType, GameOptions } from 'common/types/games/pexeso';

export function arePexesoOptionsValid(options: GameOptions): boolean {
  const setOptions = SETS[options.set];
  const cardsCount = options.differentCardsCount * options.matchingCardsCount;

  return (
    options.differentCardsCount <= setOptions.imagesCount &&
    (!options.useImageVariants || options.matchingCardsCount <= setOptions.imageVariantsCount) &&
    (options.layout === FieldLayoutType.SPIRAL || options.layout === FieldLayoutType.SPIRAL_ROTATE
      ? true
      : cardsCount in FIELD_OPTIONS[options.layout] && cardsCount < 200)
  );
}
