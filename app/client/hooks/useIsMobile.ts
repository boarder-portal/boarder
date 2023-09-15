import useMediaQuery from 'client/hooks/useMediaQuery';

export default function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)');
}
