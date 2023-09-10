import React, { useCallback } from 'react';

import { ENeighborSide, TPayments } from 'common/types/sevenWonders';

import { ITradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import ResourcesAndPrice from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/components/ResourcesAndPrice/ResourcesAndPrice';
import Modal from 'client/components/common/Modal/Modal';
import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './TradeModal.module.scss';

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
          </Flex>
        ))}
      </Flex>
    </Modal>
  );
};

export default React.memo(TradeModal);
