import { useEffect, useState } from 'react';

export default function useMediaQuery(mediaQueryString: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(mediaQueryString).matches,
  );

  useEffect(() => {
    const matchedMedia = window.matchMedia(mediaQueryString);

    setMatches(matchedMedia.matches);

    const eventListener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    matchedMedia.addEventListener('change', eventListener);

    return () => {
      matchedMedia.removeEventListener('change', eventListener);
    };
  }, [mediaQueryString]);

  return matches;
}
