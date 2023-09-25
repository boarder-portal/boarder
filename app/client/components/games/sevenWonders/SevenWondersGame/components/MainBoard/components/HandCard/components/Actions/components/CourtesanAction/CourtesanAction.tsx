import { FC, memo, useCallback } from 'react';

import { CourtesansBuildInfo } from 'client/components/games/sevenWonders/SevenWondersGame/components/MainBoard/types';
import { WithClassName } from 'client/types/react';
import { Action, Payments } from 'common/types/games/sevenWonders';
import { Card } from 'common/types/games/sevenWonders/cards';

interface CourtesanActionProps extends WithClassName {
  card: Card;
  courtesansBuildInfo: CourtesansBuildInfo;
  onCardAction(cardIndex: number, action: Action, payments?: Payments): void;
}

const CourtesanAction: FC<CourtesanActionProps> = (props) => {
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

export default memo(CourtesanAction);
