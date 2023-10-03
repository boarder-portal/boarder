import mapValues from 'lodash/mapValues';

import { GameType } from 'common/types/game';

import useImages, { Images, UseImagesOptions } from 'client/hooks/useImages';

export interface UseGameImagesOptions<Image extends string> extends Omit<UseImagesOptions<Image>, 'internal'> {
  game?: GameType;
}

export default function useGameImages<Image extends string>(
  options: UseGameImagesOptions<Image>,
): Images<Image> | null {
  const { game, sources, ...restOptions } = options;

  return useImages({
    sources: mapValues(sources, (src) => `${game ? `/games/${game}` : '/game'}/images/${src}`),
    ...restOptions,
  });
}
