import { useCallback, useMemo } from 'react';

import {
  ESevenWondersCardActionType, ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';

import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';

export default function useDiscardInfo(
  player: ISevenWondersPlayer,
  onCardAction: (cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
): {
  title: string;
  isAvailable: boolean;
  onClick(cardIndex: number): void;
} {
  const possibleBuildActions = getPossibleBuildActions(player);

  const isAvailable = useMemo(() => {
    return possibleBuildActions.includes(ESevenWondersCardActionType.DISCARD);
  }, [possibleBuildActions]);

  const title = useMemo(() => isAvailable ? 'Продать' : 'Нельзя продать', [isAvailable]);

  const onClick = useCallback((cardIndex: number) => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.DISCARD,
    });
  }, [onCardAction]);

  return useMemo(() => ({
    title,
    isAvailable,
    onClick,
  }), [isAvailable, onClick, title]);
}
