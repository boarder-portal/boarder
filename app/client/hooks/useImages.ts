import mapValues from 'lodash/mapValues';
import { useEffect, useRef, useState } from 'react';

export type Images<Image extends string> = Record<Image, HTMLImageElement>;

export type ImagesSources<Image extends string = string> = Record<Image, string>;

export interface UseImagesOptions<Image extends string> {
  sources: ImagesSources<Image>;
  internal?: boolean;
}

export default function useImages<Image extends string>(options: UseImagesOptions<Image>): Images<Image> | null {
  const { sources, internal = true } = options;

  const [loaded, setLoaded] = useState<boolean>(false);

  const imagesRef = useRef(sources);
  const htmlImagesRef = useRef<Images<Image> | null>(null);

  useEffect(() => {
    const promises: Promise<unknown>[] = [];

    htmlImagesRef.current = mapValues(imagesRef.current, (src) => {
      const image = new window.Image();

      promises.push(
        new Promise((resolve) => {
          image.addEventListener('load', resolve);

          image.src = internal ? `/public${src}` : src;
        }),
      );

      return image;
    });

    (async () => {
      await Promise.all(promises);

      setLoaded(true);
    })();
  }, [internal]);

  return loaded ? htmlImagesRef.current : null;
}
