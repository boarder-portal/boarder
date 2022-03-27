import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ESevenWondersNeighborSide, TSevenWondersPayments } from 'common/types/sevenWonders';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariants';

import Box from 'client/components/common/Box/Box';
import Modal from 'client/components/common/Modal/Modal';
import ResourcesAndPrice
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/components/ResourcesAndPrice/ResourcesAndPrice';

interface ITradeModalProps {
  isVisible: boolean;
  tradeVariants: ITradeVariant[];
  onBuild(payments: TSevenWondersPayments): void;
  onClose(): void;
}

const b = block('TradeModal');

const Root = styled(Modal)`
  .TradeModal {
    &__title {
      text-align: center;
    }

    &__container {
      min-width: 500px;
    }

    &__tradeVariant {
      border-radius: 8px;
      cursor: pointer;
      padding: 12px 20px;
      margin: 0 -20px;

      &:hover {
        background: #eee;
      }
    }
  }
`;

const TradeModal: React.FC<ITradeModalProps> = (props) => {
  const { isVisible, tradeVariants, onBuild, onClose } = props;

  return (
    <Root className={b()} containerClassName={b('container')} open={isVisible} onClose={onClose}>
      <Box className={b('title')} size="xxl" bold>Торговые варианты</Box>

      <Box flex justifyContent="space-between" mt={20}>
        <Box bold size="l">Left</Box>
        <Box bold size="l">Right</Box>
      </Box>

      <Box flex column between={8} mt={8}>
        {tradeVariants.map((tradeVariant, index) => (
          <Box className={b('tradeVariant')} key={index} flex justifyContent="space-between" onClick={() => onBuild(tradeVariant.payments)}>
            <ResourcesAndPrice
              price={tradeVariant.payments.LEFT}
              resources={tradeVariant.resources.filter((resource) => resource.owner === ESevenWondersNeighborSide.LEFT)}
            />

            <ResourcesAndPrice
              price={tradeVariant.payments.RIGHT}
              resources={tradeVariant.resources.filter((resource) => resource.owner === ESevenWondersNeighborSide.RIGHT)}
              reverse
            />
          </Box>
        ))}
      </Box>
    </Root>
  );
};

export default React.memo(TradeModal);
