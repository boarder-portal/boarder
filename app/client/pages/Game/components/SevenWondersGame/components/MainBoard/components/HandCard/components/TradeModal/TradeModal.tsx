import React, { useCallback } from 'react';

import { ENeighborSide, TPayments } from 'common/types/sevenWonders';

import { ITradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import Box from 'client/components/common/Box/Box';
import ResourcesAndPrice from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/components/ResourcesAndPrice/ResourcesAndPrice';
import Modal from 'client/components/common/Modal/Modal';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './TradeModal.pcss';

interface ITradeModalProps {
  isVisible: boolean;
  tradeVariants: ITradeVariant[];
  onBuild(payments?: TPayments): void;
  onClose(): void;
}

const TradeModal: React.FC<ITradeModalProps> = (props) => {
  const { isVisible, tradeVariants, onBuild, onClose } = props;

  const handleSelectTradeVariant = useCallback(
    (payments: TPayments) => {
      onBuild(payments);
      onClose();
    },
    [onBuild, onClose],
  );

  const handleHoverTradeVariant = useCallback(() => {
    playSound(HOVER_SOUND);
  }, []);

  return (
    <Modal containerClassName={styles.container} open={isVisible} onClose={onClose}>
      <Box className={styles.title} size="xxl" bold>
        Торговые варианты
      </Box>

      <Box flex justifyContent="space-between" mt={20}>
        <Box bold size="l">
          Left
        </Box>
        <Box bold size="l">
          Bank
        </Box>
        <Box bold size="l">
          Right
        </Box>
      </Box>

      <Box flex column between={8} mt={8}>
        {tradeVariants.map((tradeVariant, index) => (
          <Box
            className={styles.tradeVariant}
            key={index}
            flex
            onMouseEnter={handleHoverTradeVariant}
            onClick={handleSelectTradeVariant.bind(null, tradeVariant.payments)}
          >
            <ResourcesAndPrice
              price={tradeVariant.payments.LEFT}
              resources={tradeVariant.resources.filter((resource) => resource.owner === ENeighborSide.LEFT)}
            />

            <ResourcesAndPrice
              price={tradeVariant.payments.bank}
              resources={tradeVariant.resources.filter((resource) => resource.owner === 'bank')}
            />

            <ResourcesAndPrice
              price={tradeVariant.payments.RIGHT}
              resources={tradeVariant.resources.filter((resource) => resource.owner === ENeighborSide.RIGHT)}
              reverse
            />
          </Box>
        ))}
      </Box>
    </Modal>
  );
};

export default React.memo(TradeModal);
