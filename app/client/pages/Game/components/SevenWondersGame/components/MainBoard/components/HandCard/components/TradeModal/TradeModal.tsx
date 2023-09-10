import React, { useCallback } from 'react';

import { NeighborSide, Payments } from 'common/types/games/sevenWonders';

import { TradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import Flex from 'client/components/common/Flex/Flex';
import Modal from 'client/components/common/Modal/Modal';
import Text from 'client/components/common/Text/Text';
import ResourcesAndPrice from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/components/ResourcesAndPrice/ResourcesAndPrice';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './TradeModal.module.scss';

interface TradeModalProps {
  isVisible: boolean;
  tradeVariants: TradeVariant[];
  onBuild(payments?: Payments): void;
  onClose(): void;
}

const TradeModal: React.FC<TradeModalProps> = (props) => {
  const { isVisible, tradeVariants, onBuild, onClose } = props;

  const handleSelectTradeVariant = useCallback(
    (payments: Payments) => {
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
      <Text className={styles.title} size="xxl" weight="bold">
        Торговые варианты
      </Text>

      <Flex className={styles.head} justifyContent="spaceBetween">
        <Text weight="bold" size="l">
          Left
        </Text>
        <Text weight="bold" size="l">
          Bank
        </Text>
        <Text weight="bold" size="l">
          Right
        </Text>
      </Flex>

      <Flex className={styles.variants} direction="column" between={2}>
        {tradeVariants.map((tradeVariant, index) => (
          <Flex
            className={styles.tradeVariant}
            key={index}
            onMouseEnter={handleHoverTradeVariant}
            onClick={handleSelectTradeVariant.bind(null, tradeVariant.payments)}
          >
            <ResourcesAndPrice
              price={tradeVariant.payments.LEFT}
              resources={tradeVariant.resources.filter((resource) => resource.owner === NeighborSide.LEFT)}
            />

            <ResourcesAndPrice
              price={tradeVariant.payments.bank}
              resources={tradeVariant.resources.filter((resource) => resource.owner === 'bank')}
            />

            <ResourcesAndPrice
              price={tradeVariant.payments.RIGHT}
              resources={tradeVariant.resources.filter((resource) => resource.owner === NeighborSide.RIGHT)}
              reverse
            />
          </Flex>
        ))}
      </Flex>
    </Modal>
  );
};

export default React.memo(TradeModal);
