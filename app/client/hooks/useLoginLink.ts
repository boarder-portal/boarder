import { useLocation } from 'react-router-dom';

import urls from 'client/constants/urls';

export default function useLoginLink(): string {
  const { pathname, hash, search } = useLocation();
  const fullPath = pathname + search + hash;

  return `${urls.login}?from=${encodeURIComponent(fullPath)}`;
}
