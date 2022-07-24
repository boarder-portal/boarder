import { useEffect, useRef, useState } from 'react';
import mapValues from 'lodash/mapValues';

export type TImagesDictionary<Image extends string> = Record<Image, HTMLImageElement>;

export default function useImages<Image extends string>(
  images: Record<Image, string>,
): TImagesDictionary<Image> | null {
  const [loaded, setLoaded] = useState<boolean>(false);

  const imagesRef = useRef(images);
  const htmlImagesRef = useRef<TImagesDictionary<Image> | null>(null);

  useEffect(() => {
    const promises: Promise<unknown>[] = [];

    htmlImagesRef.current = mapValues(imagesRef.current, (src) => {
      const image = new Image();

      promises.push(
        new Promise((resolve) => {
          image.addEventListener('load', resolve);

          image.src = src;
        }),
      );

      return image;
    });

    (async () => {
      await Promise.all(promises);

      setLoaded(true);
    })();
  }, []);

  return loaded ? htmlImagesRef.current : null;
}
