import { useCallback, useMemo } from 'react';

import {
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import {
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

export default function useSelectGuildToCopyInfo(
  courtesansBuildInfo: ISevenWondersCourtesansBuildInfo | null,
  onCardAction: (cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
): {
  title: string;
  onClick(copiedCard: ISevenWondersCard): void;
} {
  const onClick = useCallback((copiedCard: ISevenWondersCard) => {
    if (!courtesansBuildInfo) {
      return;
    }

    onCardAction(courtesansBuildInfo.cardIndex, {
      ...courtesansBuildInfo.action,
      copiedCard,
    } as TSevenWondersAction, courtesansBuildInfo.payments);
  }, [courtesansBuildInfo, onCardAction]);

  return useMemo(() => ({
    title: 'Выбрать',
    onClick,
  }), [onClick]);
}
