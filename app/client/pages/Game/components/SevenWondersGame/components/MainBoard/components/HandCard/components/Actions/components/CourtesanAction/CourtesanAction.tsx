import React, { useCallback } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { TAction, TPayments } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';

import Box from 'client/components/common/Box/Box';

interface ICourtesanActionProps {
  className?: string;
  card: ICard;
  courtesansBuildInfo: ISevenWondersCourtesansBuildInfo;
  onCardAction(cardIndex: number, action: TAction, payments?: TPayments): void;
}

const b = block('CourtesanAction');

const Root = styled(Box)`
  .CourtesanAction {

  }
`;

const CourtesanAction: React.FC<ICourtesanActionProps> = (props) => {
  const { className, card, courtesansBuildInfo, onCardAction } = props;

  const handleSelect = useCallback(() => {
    onCardAction(courtesansBuildInfo.cardIndex, {
      ...courtesansBuildInfo.action,
      copiedCard: card,
    } as TAction, courtesansBuildInfo.payments);
  }, [card, courtesansBuildInfo.action, courtesansBuildInfo.cardIndex, courtesansBuildInfo.payments, onCardAction]);

  return (
    <Root className={b.mix(className)}>
      <div onClick={handleSelect}>Выбрать</div>
    </Root>
  );
};

export default React.memo(CourtesanAction);
