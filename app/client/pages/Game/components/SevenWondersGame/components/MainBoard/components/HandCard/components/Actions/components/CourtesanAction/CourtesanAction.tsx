import React, { useCallback } from 'react';

import { CourtesansBuildInfo } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { Action, Payments } from 'common/types/sevenWonders';
import { Card } from 'common/types/sevenWonders/cards';

interface CourtesanActionProps {
  className?: string;
  card: Card;
  courtesansBuildInfo: CourtesansBuildInfo;
  onCardAction(cardIndex: number, action: Action, payments?: Payments): void;
}

const CourtesanAction: React.FC<CourtesanActionProps> = (props) => {
  const { className, card, courtesansBuildInfo, onCardAction } = props;

  const handleSelect = useCallback(() => {
    onCardAction(
      courtesansBuildInfo.cardIndex,
      {
        ...courtesansBuildInfo.action,
        copiedCard: card,
      } as Action,
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
