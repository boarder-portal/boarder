import React, { useCallback } from 'react';

import { ISevenWondersCourtesansBuildInfo } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { TAction, TPayments } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';

interface ICourtesanActionProps {
  className?: string;
  card: ICard;
  courtesansBuildInfo: ISevenWondersCourtesansBuildInfo;
  onCardAction(cardIndex: number, action: TAction, payments?: TPayments): void;
}

const CourtesanAction: React.FC<ICourtesanActionProps> = (props) => {
  const { className, card, courtesansBuildInfo, onCardAction } = props;

  const handleSelect = useCallback(() => {
    onCardAction(
      courtesansBuildInfo.cardIndex,
      {
        ...courtesansBuildInfo.action,
        copiedCard: card,
      } as TAction,
      courtesansBuildInfo.payments,
    );
  }, [card, courtesansBuildInfo.action, courtesansBuildInfo.cardIndex, courtesansBuildInfo.payments, onCardAction]);

  return (
    <div className={className}>
      <div onClick={handleSelect}>Выбрать</div>
    </div>
  );
};

export default React.memo(CourtesanAction);
