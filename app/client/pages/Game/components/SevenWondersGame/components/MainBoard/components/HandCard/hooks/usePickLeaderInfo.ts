import { useCallback, useMemo } from 'react';

import {
  ESevenWondersCardActionType,
  ESevenWondersGamePhase,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';

export default function usePickLeaderInfo(
  gamePhase: ESevenWondersGamePhase,
  onCardAction: (cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
): {
  title: string;
  onClick(cardIndex: number): void;
} {
  const onClick = useCallback((cardIndex: number) => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.PICK_LEADER,
    });
  }, [onCardAction]);

  return useMemo(() => ({
    title: 'Выбрать',
    onClick,
  }), [onClick]);
}
