import React, { useCallback } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { TSevenWondersAction, TSevenWondersPayments } from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

import Box from 'client/components/common/Box/Box';

interface ICourtesanActionProps {
  className?: string;
  card: ISevenWondersCard;
  courtesansBuildInfo: ISevenWondersCourtesansBuildInfo;
  onCardAction(cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
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
    } as TSevenWondersAction, courtesansBuildInfo.payments);
  }, [card, courtesansBuildInfo.action, courtesansBuildInfo.cardIndex, courtesansBuildInfo.payments, onCardAction]);

  return (
    <Root className={b.mix(className)}>
      <div onClick={handleSelect}>Выбрать</div>
    </Root>
  );
};

export default React.memo(CourtesanAction);
