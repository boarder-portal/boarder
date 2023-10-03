import { useLocation } from 'react-router-dom';

export default function useLoginLink(): string {
  const { pathname, hash, search } = useLocation();
  const fullPath = pathname + search + hash;

  return `/login?from=${encodeURIComponent(fullPath)}`;
}
